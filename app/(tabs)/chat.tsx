import { ActionButton } from "@/components/buttons/ActionButton";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatListView } from "@/components/chat/ChatListView";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import {
  insertMessage,
  Message,
  saveAssistantMessage,
  useMessagesQuery,
} from "@/lib/chat";
import { buildSystemPrompt, streamChatWithGroq } from "@/lib/groq";
import { useAppStore } from "@/store/appStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatView = "active" | "list";

// ─── Timestamp separator ──────────────────────────────────────────────────────

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function TimestampSeparator({ date }: { date: string }) {
  return (
    <View className="items-center py-3">
      <Text className="font-josefin-regular text-body-sm text-white/45">
        {date}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const [view, setView] = useState<ChatView>("active");
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  // ── Scroll-to-bottom button ───────────────────────────────────────────────
  const scrollOffset = useRef(0);
  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);
  const showScrollBtn = useSharedValue(0); // 0 = hidden, 1 = visible

  const checkScrollPosition = useCallback(() => {
    const distanceFromBottom =
      contentHeight.current - layoutHeight.current - scrollOffset.current;
    // Show button when more than 80px from the bottom
    showScrollBtn.value = withTiming(distanceFromBottom > 80 ? 1 : 0, {
      duration: 200,
    });
  }, [showScrollBtn]);

  const scrollBtnStyle = useAnimatedStyle(() => ({
    opacity: showScrollBtn.value,
    transform: [{ scale: 0.7 + 0.3 * showScrollBtn.value }],
    pointerEvents: showScrollBtn.value > 0.5 ? "auto" : "none",
  }));

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const { userId, userProfile, messages, addMessage, setMessages } =
    useAppStore();

  // ── Spill animation ──────────────────────────────────────────────────────
  // Animates the burgundy background from a small circle (where tab icon lives)
  // expanding to cover the whole screen — like ink spilled on white paper.
  const spillProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      // Reset and play spill animation every time the tab gains focus
      spillProgress.value = 0;
      spillProgress.value = withTiming(1, {
        duration: 700,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
    }, []),
  );

  const spillStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      spillProgress.value,
      [0, 1],
      [0, 50],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      spillProgress.value,
      [0, 0.1, 1],
      [0, 1, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // ── Messages query ───────────────────────────────────────────────────────
  useMessagesQuery(userId);

  // ── Scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, streamingText]);

  // ── Build groq message history ───────────────────────────────────────────
  const buildGroqHistory = useCallback(
    (msgs: Message[]) => {
      const systemPrompt = buildSystemPrompt({
        favorite_brands: userProfile?.favorite_brands,
        routine_time: userProfile?.routine_time,
        beauty_vibe: userProfile?.beauty_vibe,
        xp_points: userProfile?.xp_points,
      });

      return [
        { role: "system" as const, content: systemPrompt },
        ...msgs.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
    },
    [userProfile],
  );

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (content: string) => {
      console.log(content, userId, isSending);
      if (!userId || isSending) return;
      setIsSending(true);

      // 1. Optimistic user message in store
      const optimisticUser: Message = {
        id: `opt-${Date.now()}`,
        user_id: userId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      addMessage(optimisticUser);

      // 2. Save user message to DB (don't await, fire-and-forget style)
      insertMessage(userId, "user", content)
        .then((saved) => {
          // Replace optimistic message
          const current = useAppStore.getState().messages;
          setMessages(
            current.map((m) => (m.id === optimisticUser.id ? saved : m)),
          );
        })
        .catch(() => {
          // keep optimistic if DB save fails
        });

      // 3. Build history for Groq (include the new user message)
      const history = buildGroqHistory([...messages, optimisticUser]);

      // 4. Start streaming
      setStreamingText("");

      await streamChatWithGroq(
        history,
        (chunk) => {
          setStreamingText((prev) => (prev ?? "") + chunk);
        },
        async (fullText) => {
          // Remove streaming placeholder
          setStreamingText(null);
          setIsSending(false);

          // Save AI response
          try {
            await saveAssistantMessage(userId, fullText);
          } catch {
            // If save fails, add to store anyway so UI stays consistent
            const fallbackMsg: Message = {
              id: `ai-${Date.now()}`,
              user_id: userId,
              role: "assistant",
              content: fullText,
              created_at: new Date().toISOString(),
            };
            addMessage(fallbackMsg);
          }
        },
        (err) => {
          console.error("Groq stream error:", err);
          setStreamingText(null);
          setIsSending(false);
          // Show error bubble
          const errMsg: Message = {
            id: `err-${Date.now()}`,
            user_id: userId,
            role: "assistant",
            content:
              "Sorry, I couldn't connect right now. Please try again! 💄",
            created_at: new Date().toISOString(),
          };
          addMessage(errMsg);
        },
      );
    },
    [userId, isSending, messages, addMessage, setMessages, buildGroqHistory],
  );

  const handleSuggestionSelect = useCallback(
    (question: string) => {
      setView("active");
      handleSend(question);
    },
    [handleSend],
  );

  // ── Render list item ─────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const prev = messages[index - 1];
      const showTimestamp =
        !prev ||
        new Date(item.created_at).getTime() -
          new Date(prev.created_at).getTime() >
          5 * 60 * 1000; // 5 min gap

      const isLastMessage = index === messages.length - 1;
      return (
        <>
          {showTimestamp && (
            <TimestampSeparator date={formatTimestamp(item.created_at)} />
          )}
          <ChatBubble
            role={item.role}
            content={item.content}
            isStreaming={item.role === "assistant" && isLastMessage}
          />
        </>
      );
    },
    [messages],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-deep-crimson-900">
      {/* Spill animation overlay — burgundy circle that expands on tab focus */}
      <View
        className="absolute inset-0 items-center justify-end pb-10 z-0"
        pointerEvents="none"
      >
        <Animated.View
          style={[
            {
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#200007",
            },
            spillStyle,
          ]}
        />
      </View>

      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="h-12 flex-row items-center justify-between px-4 bg-deep-crimson-900">
          <Pressable
            className={twMerge(
              "w-8 h-8 rounded-full border border-grey-100 items-center justify-center bg-transparent",
              view === "list" ? "opacity-1" : "opacity-0"
            )}
            onPress={() => (view === "list" ? setView("active") : undefined)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-white text-sm leading-[18px]">←</Text>
          </Pressable>

          <Text className="font-josefin text-body-sm text-white text-center">
            {view === "list" ? "Chats" : "Chat with Beaut.ai"}
          </Text>

          <Pressable
            className={twMerge(
              "w-8 h-8 rounded-full border border-grey-100 items-center justify-center bg-transparent",
              view === "list" ? "opacity-0" : "opacity-1"
            )}
            onPress={() => setView("list")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {/* Edit / new chat icon */}
            <Text className="text-white text-sm leading-[18px]">✎</Text>
          </Pressable>
        </View>

        {view === "list" ? (
          /* ── Chat list ────────────────────────────────────────── */
          <ChatListView onSelectSuggestion={handleSuggestionSelect} />
        ) : (
          /* ── Active chat ──────────────────────────────────────── */
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
          >
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerClassName="pt-4 pb-2"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<SuggestedQuestions onSelect={handleSend} />}
              onScroll={(e) => {
                scrollOffset.current = e.nativeEvent.contentOffset.y;
                checkScrollPosition();
              }}
              onContentSizeChange={(_w, h) => {
                contentHeight.current = h;
                checkScrollPosition();
              }}
              onLayout={(e) => {
                layoutHeight.current = e.nativeEvent.layout.height;
                checkScrollPosition();
              }}
              scrollEventThrottle={16}
            />

            {/* Scroll-to-bottom button */}
            <Animated.View
              style={scrollBtnStyle}
              className="absolute bottom-20 right-4"
            >
              <ActionButton
                text=""
                suffixIcon={
                  <Ionicons name="arrow-down" size={18} color="#ffffff" />
                }
                onPress={scrollToBottom}
                containerClassName="w-10 h-10 rounded-full px-0 justify-center items-center"
              />
            </Animated.View>

            <ChatInput onSend={handleSend} disabled={isSending} />
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}
