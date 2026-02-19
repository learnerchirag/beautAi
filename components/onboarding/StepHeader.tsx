import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface StepHeaderProps {
  title: string;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export default function StepHeader({
  title,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: StepHeaderProps) {
  return (
    <View className="flex-row items-center w-full gap-0">
      <TouchableOpacity
        onPress={onPrev}
        disabled={!canGoPrev}
        className="border border-grey-100 rounded-sm p-1 items-center justify-center"
        style={{ opacity: canGoPrev ? 1 : 0.3 }}
      >
        <Ionicons name="chevron-back" size={12} color="#000" />
      </TouchableOpacity>

      <Text
        className="flex-1 text-center text-core-black"
        style={{
          fontFamily: "JosefinSans_600SemiBold",
          fontSize: 12,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>

      <TouchableOpacity
        onPress={onNext}
        disabled={!canGoNext}
        className="border border-grey-100 rounded-sm p-1 items-center justify-center"
        style={{ opacity: canGoNext ? 1 : 0.3 }}
      >
        <Ionicons name="chevron-forward" size={12} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
