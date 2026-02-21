import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Message } from "./types";

// Re-export for callers that import Message from "@/lib/chat"
export type { Message } from "./types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const MESSAGES_QUERY_KEY = (userId: string) =>
  ["messages", userId] as const;

// ─── Supabase Utilities ───────────────────────────────────────────────────────

/**
 * Fetches all messages for a user from Supabase, ordered oldest-first.
 */
export async function fetchMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

/**
 * Inserts a message row and returns the saved message.
 */
export async function insertMessage(
  userId: string,
  role: "user" | "assistant",
  content: string,
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ user_id: userId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

// ─── TanStack Query Hooks ─────────────────────────────────────────────────────

/**
 * Fetches messages for the current user and syncs them into the Zustand store.
 */
export function useMessagesQuery(userId: string | null) {
  const { setMessages } = useAppStore();

  return useQuery({
    queryKey: MESSAGES_QUERY_KEY(userId ?? ""),
    queryFn: async () => {
      if (!userId) return [];
      const msgs = await fetchMessages(userId);
      setMessages(msgs);
      return msgs;
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Mutation for sending a user message (optimistic) + triggering AI response.
 * onAiChunk is called as streaming chunks arrive.
 * onAiDone is called with the full AI text so the caller can save to DB.
 */
export function useSendMessage(
  userId: string | null,
  onAiChunk: (chunk: string) => void,
  onAiDone: (fullText: string) => void,
) {
  const queryClient = useQueryClient();
  const { addMessage } = useAppStore();

  return useMutation({
    mutationFn: async (content: string): Promise<Message> => {
      if (!userId) throw new Error("Not authenticated");
      return insertMessage(userId, "user", content);
    },
    onMutate: async (content: string) => {
      // Optimistic user message
      const optimisticMsg: Message = {
        id: `optimistic-${Date.now()}`,
        user_id: userId ?? "",
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      addMessage(optimisticMsg);
      return { optimisticMsg };
    },
    onSuccess: (savedMsg, _content, context) => {
      // Replace optimistic message with the real one
      const { setMessages } = useAppStore.getState();
      const msgs = useAppStore.getState().messages;
      setMessages(
        msgs.map((m) => (m.id === context?.optimisticMsg.id ? savedMsg : m)),
      );
      // Invalidate query to keep cache fresh
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEY(userId ?? ""),
      });
    },
    onError: (_err, _content, context) => {
      // Remove the optimistic message on failure
      if (context?.optimisticMsg) {
        const { setMessages } = useAppStore.getState();
        const msgs = useAppStore.getState().messages;
        setMessages(msgs.filter((m) => m.id !== context.optimisticMsg.id));
      }
    },
  });
}

/**
 * Saves the AI assistant response to Supabase and updates the store.
 */
export async function saveAssistantMessage(
  userId: string,
  content: string,
): Promise<Message> {
  const msg = await insertMessage(userId, "assistant", content);
  const { addMessage } = useAppStore.getState();
  addMessage(msg);
  return msg;
}
