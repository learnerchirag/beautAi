import React from "react";
import { Pressable, Text, View } from "react-native";

const SUGGESTED_QUESTIONS = [
  "What's the best skincare routine for oily skin?",
  "Can you recommend a moisturiser for sensitive skin?",
  "How do I treat dark circles under my eyes?",
  "What's the difference between AHA and BHA exfoliants?",
  "How often should I exfoliate my face?",
  "What SPF should I use for daily sun protection?",
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <View className="px-4 pt-6 gap-4">
      <Text className="font-josefin-regular text-body-sm text-white/45 mb-2 ml-0.5">
        Suggested questions
      </Text>
      {SUGGESTED_QUESTIONS.map((question) => (
        <Pressable
          key={question}
          className="bg-deep-crimson-700 rounded-xs border border-deep-crimson-700 px-3 py-3 flex-row items-center mb-0.5 active:bg-[#730018] active:border-[#730018]"
          onPress={() => onSelect(question)}
        >
          <Text
            className="flex-1 font-josefin text-body-sm text-white"
            numberOfLines={2}
          >
            {question}
          </Text>
          <Text className="text-xl text-white/50 leading-6 ml-1">›</Text>
        </Pressable>
      ))}
    </View>
  );
}

export { SUGGESTED_QUESTIONS };
