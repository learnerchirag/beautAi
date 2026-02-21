import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { UserProfile } from "@/lib/profile";
import { Message } from "@/lib/types";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const PROFILE_STORAGE_KEY = "user_profile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  userId: string | null;
  isAuthenticated: boolean;

  // User profile (full, from Supabase profiles table)
  userProfile: UserProfile | null;

  // Chat messages
  messages: Message[];

  // UI
  isLoading: boolean;

  // Actions
  setUserId: (id: string | null) => void;
  setUserProfile: (profile: UserProfile | null) => Promise<void>;
  clearUserProfile: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  // Chat actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  userId: null,
  isAuthenticated: false,
  userProfile: null,
  messages: [],
  isLoading: false,

  // Actions
  setUserId: (id) =>
    set({
      userId: id,
      isAuthenticated: id !== null,
    }),

  setUserProfile: async (profile) => {
    set({ userProfile: profile });
    if (profile) {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  },

  clearUserProfile: async () => {
    set({ userProfile: null });
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    set({
      userId: null,
      isAuthenticated: false,
      userProfile: null,
      messages: [],
    });
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
  },

  // Chat actions
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
