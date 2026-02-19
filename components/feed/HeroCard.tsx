import { Image } from "expo-image";
import { Text, View } from "react-native";

import { Post } from "@/lib/supabase";

interface HeroCardProps {
  post: Post;
}

export function HeroCard({ post }: HeroCardProps) {
  return (
    <View className="mx-4 h-[180px] rounded-lg overflow-hidden bg-grey-100">
      <Image
        source={{ uri: post.image_url }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
        transition={300}
      />
      {/* Gradient overlay via semi-transparent View */}
      <View className="absolute bottom-0 left-0 right-0 h-[90px] bg-black/30" />

      {/* Category label — top left */}
      <Text className="absolute top-4 left-4 font-josefin-regular text-body-sm text-core-white capitalize">
        {post.category}
      </Text>

      {/* Title — bottom left */}
      <Text
        className="absolute bottom-4 left-4 right-4 font-josefin-bold text-display-xl text-core-white"
        numberOfLines={2}
      >
        {post.title}
      </Text>
    </View>
  );
}

export function HeroCardSkeleton() {
  return <View className="mx-4 h-[180px] rounded-lg bg-grey-200" />;
}
