import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FeedGrid } from "@/components/feed/FeedGrid";
import { FilterChips } from "@/components/feed/FilterChips";
import { FeedFilter, useFeedQuery } from "@/lib/posts";

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>("For You");

  const { data: posts = [], isLoading, refetch, isRefetching } = useFeedQuery();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-core-white" edges={["top"]}>
      {/* Sticky filter bar */}
      <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />

      {/* Feed */}
      <View className="flex-1">
        <FeedGrid
          posts={posts}
          isLoading={isLoading}
          isRefreshing={isRefetching}
          onRefresh={handleRefresh}
          filter={selectedFilter}
        />
      </View>
    </SafeAreaView>
  );
}
