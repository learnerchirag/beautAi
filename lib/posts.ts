import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

import { AUTH_STORAGE_KEY } from "@/hooks/use-auth";
import { useAppStore } from "@/store/appStore";
import { fetchUserProfile } from "./profile";
import { fetchPostsFeed, Post } from "./supabase";

// ─── Feed Filters ─────────────────────────────────────────────────────────────

export const FEED_FILTERS = [
  "For You",
  "Trending",
  "Your Routine",
  "Scans",
] as const;

export type FeedFilter = (typeof FEED_FILTERS)[number];

// ─── Scoring Algorithm ────────────────────────────────────────────────────────

/** Subset of UserProfile needed purely for feed scoring. */
interface ScoringProfile {
  beauty_vibe?: string;
  favorite_brands?: string[];
}

export function scorePosts(posts: Post[], profile: ScoringProfile): Post[] {
  if (!posts.length) return posts;

  const maxLikes = Math.max(...posts.map((p) => p.like_count), 1);

  const scored = posts.map((post) => {
    // Relevance: Does post match user's vibe or brands?
    const relevance =
      (profile.beauty_vibe && post.tags.includes(profile.beauty_vibe)) ||
      (profile.favorite_brands &&
        profile.favorite_brands.some((b) =>
          post.tags.includes(b.toLowerCase()),
        ))
        ? 1.0
        : 0.3;

    // Recency: Newer = higher score
    const hoursOld =
      (Date.now() - new Date(post.created_at).getTime()) / 3600000;
    const recency = Math.max(0, 1 - hoursOld / 168);

    // Popularity: Normalized likes
    const popularity = post.like_count / maxLikes;

    const score = relevance * 0.5 + recency * 0.3 + popularity * 0.2;
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ post, score }) => ({ ...post, score }));
}

export function sortByTrending(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.like_count - a.like_count);
}

// ─── TanStack Query Hook ──────────────────────────────────────────────────────

export const POSTS_QUERY_KEY = ["posts", "feed"] as const;

/**
 * Fetches the post feed and — if the Zustand store doesn't yet have a
 * userProfile — loads and caches it before returning so that FeedGrid
 * can score posts immediately with a real profile.
 */
export function useFeedQuery() {
  const { userProfile, setUserProfile } = useAppStore();

  return useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: async () => {
      // Ensure a profile is in Zustand before we return data
      if (!userProfile) {
        const userId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (userId) {
          try {
            const profile = await fetchUserProfile(userId);
            await setUserProfile(profile);
          } catch {
            // Profile fetch failed — scoring will degrade gracefully
          }
        }
      }
      return fetchPostsFeed();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
