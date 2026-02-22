import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { ActionButton } from "../buttons/ActionButton";
import GradientBorder from "../ui/gradient-border";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View className="px-4 py-3 bg-deep-crimson-900">
      <GradientBorder containerStyle={{ padding: 1 }}>
        <View className="flex-row items-center bg-deep-crimson-900 rounded-xs p-3 gap-2">
          <TextInput
            ref={inputRef}
            className="flex-1 font-josefin-regular text-body-md text-white max-h-[100px] leading-none"
            placeholder="Type message"
            placeholderTextColor="#e0e0e0"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!disabled}
            multiline
            maxLength={1000}
          />
          <ActionButton
            onPress={handleSend}
            suffixIcon={
              <Ionicons
                name="send"
                size={18}
                color={canSend ? "white" : "#e0e0e0"}
              />
            }
            disabled={!canSend}
            containerClassName={`rounded-full items-center justify-center px-0 py-0 self-end bg-transparent`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          />
        </View>
      </GradientBorder>
    </View>
  );
}
