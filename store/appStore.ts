import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { UserProfile } from "@/lib/profile";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const PROFILE_STORAGE_KEY = "user_profile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  userId: string | null;
  isAuthenticated: boolean;

  // User profile (full, from Supabase profiles table)
  userProfile: UserProfile | null;

  // UI
  isLoading: boolean;

  // Actions
  setUserId: (id: string | null) => void;
  setUserProfile: (profile: UserProfile | null) => Promise<void>;
  clearUserProfile: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  userId: null,
  isAuthenticated: false,
  userProfile: null,
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
    set({ userId: null, isAuthenticated: false, userProfile: null });
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
  },
}));
