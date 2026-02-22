import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
console.log(supabaseUrl, supabaseAnonKey, "supabase");
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Likes ──────────────────────────────────────────────────────────────────

export interface UserLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

/**
 * Returns the list of post IDs liked by the given user.
 */
export async function fetchUserLikes(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_likes")
    .select("post_id")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.post_id as string);
}

/**
 * Toggles the like state for the current user on a given post.
 * - If the row already exists it is deleted (unlike).
 * - If it does not exist it is inserted (like).
 * Returns `true` when the post is now liked, `false` when unliked.
 */
export async function togglePostLike(
  userId: string,
  postId: string,
  isCurrentlyLiked: boolean,
): Promise<boolean> {
  if (isCurrentlyLiked) {
    // Unlike – remove the row
    const { error } = await supabase
      .from("user_likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    if (error) throw error;
    return false;
  } else {
    // Like – insert a new row
    const { error } = await supabase
      .from("user_likes")
      .insert({ user_id: userId, post_id: postId });

    if (error) throw error;
    return true;
  }
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  image_url: string;
  author_name: string;
  category: string; // "content" | "product"
  tags: string[];
  like_count: number;
  created_at: string;
  // Product-specific (optional)
  price?: string;
  brand?: string;
}

/**
 * Fetches all posts from Supabase, ordered newest first.
 * Used by TanStack Query hooks in lib/posts.ts.
 */
export async function fetchPostsFeed(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Post[];
}

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * Returns whether onboarding has been completed for a given user ID.
 * Used by the login flow to decide which screen to navigate to.
 */
export async function fetchOnboardingStatus(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", userId)
    .single();

  return data?.onboarding_complete === true;
}

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
