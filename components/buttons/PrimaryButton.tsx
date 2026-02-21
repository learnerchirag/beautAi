import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const onPressHandler = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={onPressHandler}
      disabled={isDisabled}
      style={({ pressed }) => ({ opacity: pressed || isDisabled ? 0.7 : 1 })}
      className="bg-deep-crimson rounded-sm h-12 items-center justify-center px-4"
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="font-josefin text-body-lg text-core-white text-center capitalize">
          {label}
        </Text>
      )}
    </Pressable>
  );
}
