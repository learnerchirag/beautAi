import React from "react";
import { Text, View } from "react-native";

import { StreamingText } from "./StreamingText";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  /** When true, content is rendered with the ChatGPT-like word fade-in animation */
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View
      className={`flex-row px-4 mb-1.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <View
        className={`max-w-[75%] rounded-sm p-3 overflow-hidden ${
          isUser ? "bg-deep-crimson" : "bg-deep-crimson-700"
        }`}
      >
        {isStreaming ? (
          <StreamingText
            text={content}
            isStreaming
            textClass={"font-josefin-regular text-body-sm text-white"}
          />
        ) : (
          <Text className="font-josefin-regular text-body-sm text-white">
            {content}
          </Text>
        )}
      </View>
    </View>
  );
}
