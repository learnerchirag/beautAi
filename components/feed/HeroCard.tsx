import { Image } from "expo-image";
import { Text, View } from "react-native";

import { Post } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";

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

      {/* Category label — top left */}
      <Text className="absolute top-4 left-4 font-josefin-regular text-body-sm text-core-white capitalize">
        {post.category}
      </Text>

      {/* Title — bottom left */}
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.00)", "rgba(0, 0, 0, 0.32)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        <Text
          className="font-josefin-bold text-display-xl text-core-white"
          numberOfLines={2}
        >
          {post.title}
        </Text>
      </LinearGradient>
    </View>
  );
}

export function HeroCardSkeleton() {
  return <View className="mx-4 h-[180px] rounded-lg bg-grey-200" />;
}
