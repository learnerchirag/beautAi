import React from "react";
import { Pressable, Text } from "react-native";

export type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({ opacity: pressed || disabled ? 0.7 : 1 })}
      className="border-[1.5px] border-deep-crimson rounded-sm h-12 items-center justify-center px-4"
    >
      <Text className="font-josefin text-body-lg text-core-black text-center capitalize">
        {label}
      </Text>
    </Pressable>
  );
}
