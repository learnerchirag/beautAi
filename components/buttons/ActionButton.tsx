import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Wrap Pressable with Animated so we can animate it
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ActionButtonProps = {
  /** Optional icon rendered before the label */
  prefixIcon?: React.ReactNode;
  /** Button label text */
  text?: string;
  /** Optional icon rendered after the label */
  suffixIcon?: React.ReactNode;
  /** Triggered when the button is tapped */
  onPress: () => void;
  /** Shows a loading overlay and disables the button */
  loading?: boolean;
  /** Disables the button */
  disabled?: boolean;
  /** Tailwind classes applied to the outer container */
  containerClassName?: string;
  /** Tailwind classes applied to the label text */
  textClassName?: string;

  hitSlop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
};

const SCALE_DOWN = 0.95;
const SCALE_NORMAL = 1;

export function ActionButton({
  prefixIcon,
  text,
  suffixIcon,
  onPress,
  loading = false,
  disabled = false,
  containerClassName = "",
  textClassName = "",
  hitSlop = {},
}: ActionButtonProps) {
  const scale = useSharedValue(SCALE_NORMAL);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(SCALE_DOWN, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(SCALE_NORMAL, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [isDisabled, onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={animatedStyle}
      className={`bg-deep-crimson rounded-sm flex-row items-center justify-center gap-x-2 px-4 ${
        isDisabled ? "opacity-60" : "opacity-100"
      } ${containerClassName}`}
      hitSlop={hitSlop}
    >
      {/* Loading overlay — sits on top, centred */}
      {loading && (
        <View className="absolute inset-0 items-center justify-center rounded-sm bg-deep-crimson">
          <ActivityIndicator color="#ffffff" />
        </View>
      )}

      {/* Prefix icon */}
      {prefixIcon && <View>{prefixIcon}</View>}

      {/* Label */}
      {text && (
        <Text
          className={`font-josefin text-body-lg text-core-white ${textClassName}`}
          numberOfLines={1}
        >
          {text}
        </Text>
      )}

      {/* Suffix icon */}
      {suffixIcon && <View>{suffixIcon}</View>}
    </AnimatedPressable>
  );
}
