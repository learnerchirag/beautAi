import React from "react";
import { View } from "react-native";
import Animated, {
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number; // 1-indexed
}

export default function ProgressBar({
  totalSteps,
  currentStep,
}: ProgressBarProps) {
  return (
    <View className="flex-row gap-1 w-full h-1">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <StepBar key={i} active={i < currentStep} />
      ))}
    </View>
  );
}

function StepBar({ active }: { active: boolean }) {
  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(active ? "#008080" : "#f5f5f5", {
      duration: 300,
    }),
  }));

  return (
    <Animated.View
      style={[animStyle, { flex: 1, height: 4, borderRadius: 8 }]}
    />
  );
}
