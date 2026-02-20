import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  onboarding_complete: boolean;
  beauty_vibe?: string;
  favorite_brands?: string[];
  routine_time?: string;
  xp_points?: number;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const PROFILE_QUERY_KEY = (userId: string) =>
  ["profile", userId] as const;

// ─── Fetch Function ──────────────────────────────────────────────────────────

/**
 * Fetches the full profile for a given user ID from Supabase.
 * Throws on error so TanStack Query / callers can handle it uniformly.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as UserProfile;
}
