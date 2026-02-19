import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface XPBadgeProps {
  xp: number;
}

export default function XPBadge({ xp }: XPBadgeProps) {
  return (
    <View className="flex-row items-center gap-1 bg-grey-100 border border-grey-200 rounded-xs px-3 py-2 self-center">
      <Ionicons name="pricetag-outline" size={14} color="#000" />
      <Text
        style={{
          fontFamily: "JosefinSans_600SemiBold",
          fontSize: 12,
          letterSpacing: -0.3,
          color: "#000",
        }}
      >
        +{xp}XP
      </Text>
    </View>
  );
}
