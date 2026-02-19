import { useQuery } from "@tanstack/react-query";

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

export interface UserProfile {
  beauty_vibe?: string;
  favorite_brands?: string[];
}

export function scorePosts(posts: Post[], profile: UserProfile): Post[] {
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

export function useFeedQuery() {
  return useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: fetchPostsFeed,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
