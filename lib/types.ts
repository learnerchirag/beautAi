// ─── Shared Chat Types ────────────────────────────────────────────────────────
// Kept separate to avoid circular imports between lib/chat.ts and store/appStore.ts

export interface Message {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
