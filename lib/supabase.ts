import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://opgufymexgfhjbmznxda.supabase.co";
const supabaseAnonKey =
  "***REMOVED***";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingData {
  favorite_brands: string[];
  routine_time: string; // e.g. "15-30"
  beauty_vibe: string; // e.g. "natural"
  xp_points: number; // 10 + 30 + 40 = 80
}

/**
 * Saves onboarding selections to the current user's profile row and marks
 * onboarding as complete. Safe to call without awaiting — errors are returned,
 * not thrown.
 */
export async function updateOnboardingProfile(data: OnboardingData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: new Error("No authenticated user") };

  return supabase
    .from("profiles")
    .update({
      ...data,
      onboarding_complete: true,
    })
    .eq("id", user.id);
}
