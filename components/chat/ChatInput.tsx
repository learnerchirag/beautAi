import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { ActionButton } from "../buttons/ActionButton";

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
      <View className="flex-row items-center bg-deep-crimson-900 border border-creamy-vanilla rounded-xs p-3 gap-2">
        <TextInput
          ref={inputRef}
          className="flex-1 font-josefin-regular text-body-md text-white min-h-[20px] max-h-[100px] pt-0 pb-0"
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
              size={12}
              color={canSend ? "white" : "#e0e0e0"}
            />
          }
          disabled={!canSend}
          containerClassName={`rounded-full items-center justify-center px-2 py-2 self-end ${
            canSend ? "bg-creamy-vanilla" : "bg-white/15"
          }`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />
        {/* <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [{ opacity: pressed && canSend ? 0.8 : 1 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className={`w-7 h-7 rounded-full items-center justify-center ${
            canSend ? "bg-creamy-vanilla" : "bg-white/15"
          }`}
        >
          <Text
            className={`text-base font-bold leading-[18px] ${
              canSend ? "text-deep-crimson-900" : "text-white/25"
            }`}
          >
            ↑
          </Text>
        </Pressable> */}
      </View>
    </View>
  );
}
