import { Image } from "expo-image";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { BagIcon } from "@/assets/icons/BagIcon";
import HeartIcon from "@/assets/icons/HeartIcon";
import { Post } from "@/lib/supabase";

interface ProductCardProps {
  post: Post;
  width?: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export function ProductCard({
  post,
  width,
  isLiked = false,
  onLike,
}: ProductCardProps) {
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
      // Show heart animation when liking (not when unliking)
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
      <View className="h-[152px] rounded-md overflow-hidden bg-grey-100">
        <Image
          source={{ uri: post.image_url }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={300}
        />
        {isLiked && (
          <View className="absolute top-3 left-3">
            <HeartIcon width={20} height={20} color="#610014" />
          </View>
        )}
        {/* Bag icon — top right, creamy vanilla bg, blurred */}
        <View className="absolute top-3 right-2 bg-creamy-vanilla p-1 rounded-sm items-center justify-center">
          <BagIcon width={12} height={12} color="#000" />
        </View>
        {/* Heart animation overlay */}
        <Animated.Text
          className="absolute self-center top-[30%] text-[40px]"
          style={heartStyle}
        >
          ❤️
        </Animated.Text>
      </View>

      {/* Text */}
      <View className="py-3 gap-0.5">
        <Text
          className="font-josefin text-body-md text-core-black"
          numberOfLines={2}
        >
          {post.title}
        </Text>
        {post.price && (
          <Text
            className="font-josefin-regular text-body-sm text-core-black"
            numberOfLines={1}
          >
            £{post.price}
          </Text>
        )}
        {post.brand && (
          <Text
            className="font-josefin-regular text-body-sm text-grey-600"
            numberOfLines={1}
          >
            {post.brand}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function ProductCardSkeleton() {
  return (
    <View className="flex-col w-[128px]">
      <View className="h-[152px] rounded-md bg-grey-200" />
      <View className="py-3 gap-2">
        <View className="h-3 w-full rounded bg-grey-200" />
        <View className="h-3 w-1/2 rounded bg-grey-200" />
      </View>
    </View>
  );
}
