import { Image } from "expo-image";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import HeartIcon from "@/assets/icons/HeartIcon";
import { Post } from "@/lib/supabase";

interface ContentCardProps {
  post: Post & { score?: number };
  width?: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export function ContentCard({
  post,
  width,
  isLiked = false,
  onLike,
}: ContentCardProps) {
  const heartScale = useSharedValue(0);
  const lastTap = useRef<number>(0);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      onLike?.(post.id);
      // Show the heart animation when liking (not when unliking)
      if (!isLiked) {
        heartScale.value = withSequence(
          withTiming(1.4, { duration: 200 }),
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 300 }),
        );
      }
    }
    lastTap.current = now;
  };

  return (
    <Pressable
      className="flex-col"
      style={width ? { width } : undefined}
      onPress={handleDoubleTap}
    >
      {/* Image */}
      <View className="h-[260px] rounded-md overflow-hidden bg-grey-100">
        <Image
          source={{ uri: post.image_url }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={300}
        />
        {isLiked && (
          <View className="absolute top-3 left-3">
            <HeartIcon width={24} height={24} color="#610014" />
          </View>
        )}
        {/* Heart animation overlay */}
        <Animated.Text
          className="absolute self-center top-[40%] text-[56px]"
          style={heartStyle}
        >
          ❤️
        </Animated.Text>
      </View>

      {/* Content */}
      <View className="py-3 gap-1">
        <Text
          className="font-josefin text-body-lg text-core-black"
          numberOfLines={2}
        >
          {post.title}
        </Text>
        <Text
          className="font-josefin-regular text-body-sm text-grey-600"
          numberOfLines={1}
        >
          {post.author_name}
        </Text>
        <Text
          className="font-josefin-regular text-body-sm text-grey-600"
          numberOfLines={1}
        >
          {(post.score || 0) * 100}
        </Text>
      </View>
    </Pressable>
  );
}

export function ContentCardSkeleton() {
  return (
    <View className="flex-col">
      <View className="h-[260px] rounded-md bg-grey-200" />
      <View className="py-3 gap-2">
        <View className="h-3 w-4/5 rounded bg-grey-200" />
        <View className="h-3 w-1/2 rounded bg-grey-200" />
      </View>
    </View>
  );
}
