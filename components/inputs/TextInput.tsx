import React from "react";
import { TextInput as RNTextInput, Text, View } from "react-native";
import { twMerge } from "tailwind-merge";

export type TextInputProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  error: string | null;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  keyboardType?: "email-address" | "default";
  autoCapitalize?: "none" | "sentences";
};

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  rightElement,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: TextInputProps) {
  return (
    <View className="flex-col gap-1 w-full">
      {/* Label */}
      <View className="px-3">
        <Text className="font-josefin-regular text-[10px] text-core-black tracking-[-0.2px]">
          {label}
        </Text>
      </View>
      {/* Input field */}
      <View
        className={twMerge(
          "bg-core-white border rounded-xs flex-row items-center px-3 py-3 gap-1",
          error ? "border-deep-crimson" : "border-grey-200"
        )}
      >
        <RNTextInput
          className="flex-1 font-josefin-regular text-body-md text-core-black tracking-[-0.35px] leading-none"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#bdbdbd"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          placeholderClassName="text-body-md"
        />
        {rightElement}
      </View>
      {/* Inline error */}
      <View className="px-3 h-[14px] justify-center">
        {error ? (
          <Text className="font-josefin-regular text-[10px] text-deep-crimson tracking-[-0.2px]">
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
