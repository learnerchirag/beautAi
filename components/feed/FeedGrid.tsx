import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { FeedFilter, scorePosts, sortByTrending } from "@/lib/posts";
import { Post } from "@/lib/supabase";
import { useAppStore } from "@/store/appStore";
import { ContentCard, ContentCardSkeleton } from "./ContentCard";
import { HeroCard, HeroCardSkeleton } from "./HeroCard";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 16;
const GAP = 12;
const LEFT_COL_WIDTH = Math.floor((SCREEN_WIDTH - H_PADDING * 2 - GAP) * 0.57);
const RIGHT_COL_WIDTH = SCREEN_WIDTH - H_PADDING * 2 - GAP - LEFT_COL_WIDTH;

interface FeedGridProps {
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  filter: FeedFilter;
}

export function FeedGrid({
  posts,
  isLoading,
  isRefreshing,
  onRefresh,
  filter,
}: FeedGridProps) {
  console.log(posts);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Real user profile from Zustand — populated at login or by useFeedQuery
  const userProfile = useAppStore((s) => s.userProfile) ?? {};

  console.log(userProfile, "userProfile");

  const handleLike = useCallback((id: string) => {
    setLikedIds((prev) => new Set(prev).add(id));
  }, []);

  const sortedPosts = useMemo(() => {
    if (!posts.length) return [];
    switch (filter) {
      case "For You":
        return scorePosts(posts, userProfile);
      case "Trending":
        return sortByTrending(posts);
      case "Your Routine":
        return posts.filter((p) =>
          p.tags?.some((t) =>
            ["routine", "skincare", "moisturizer", "cleanser"].includes(t),
          ),
        );
      case "Scans":
        return posts.filter((p) => p.tags?.includes("scan"));
      default:
        return posts;
    }
  }, [posts, filter]);

  const heroPost = sortedPosts[0] ?? null;
  const gridPosts = sortedPosts.slice(1);

  const isProductPost = (p: Post) => Boolean(p.brand || p.price);
  const leftPosts = gridPosts.filter((p) => !isProductPost(p));
  const rightPosts = gridPosts.filter((p) => isProductPost(p));

  if (isLoading) {
    return (
      <ScrollView
        contentContainerClassName="pb-8 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <HeroCardSkeleton />
        </View>
        <View className="flex-row gap-3 px-4 items-start">
          <View style={{ width: LEFT_COL_WIDTH }} className="gap-3">
            <ContentCardSkeleton />
            <ContentCardSkeleton />
          </View>
          <View style={{ width: RIGHT_COL_WIDTH }} className="gap-3">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!sortedPosts.length) {
    return (
      <ScrollView contentContainerClassName="flex-1 items-center justify-center pt-20 px-8 gap-2">
        <Text className="text-[48px]">✨</Text>
        <Text className="font-josefin-bold text-display-md text-core-black">
          No posts yet
        </Text>
        <Text className="font-josefin-regular text-body-sm text-grey-600 text-center">
          Check back soon for your personalised feed.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerClassName="pb-8 pt-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#008080"
          colors={["#008080"]}
        />
      }
    >
      {/* Hero card — full width at top */}
      {heroPost && (
        <View className="mb-4">
          <HeroCard post={heroPost} />
        </View>
      )}

      {/* Non-uniform 2-column grid */}
      <View className="flex-row px-4 gap-3 items-start">
        {/* Left column — wider, ContentCards */}
        <View style={{ width: LEFT_COL_WIDTH }} className="gap-3">
          {leftPosts.map((post) => (
            <ContentCard
              key={post.id}
              post={post}
              width={LEFT_COL_WIDTH}
              onLike={handleLike}
            />
          ))}
        </View>

        {/* Right column — narrower, ProductCards */}
        <View style={{ width: RIGHT_COL_WIDTH }} className="gap-3">
          {rightPosts.map((post) => (
            <ProductCard
              key={post.id}
              post={post}
              width={RIGHT_COL_WIDTH}
              onLike={handleLike}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
