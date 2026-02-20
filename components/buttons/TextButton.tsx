import React from "react";
import { Pressable, Text } from "react-native";

export type TextButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function TextButton({
  label,
  onPress,
  disabled = false,
}: TextButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed || disabled ? 0.5 : 1 })}
    >
      <Text className="font-josefin-regular text-body-md text-deep-crimson text-center underline">
        {label}
      </Text>
    </Pressable>
  );
}
