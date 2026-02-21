import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const SUGGESTED_QUESTIONS = [
  "What's the best skincare routine for oily skin?",
  "Can you recommend a moisturiser for sensitive skin?",
  "How do I treat dark circles under my eyes?",
  "What's the difference between AHA and BHA exfoliants?",
  "How often should I exfoliate my face?",
  "What SPF should I use for daily sun protection?",
];

const ROUTINES = ["Morning Routine", "Night Time Routine"];

interface ChatListViewProps {
  onSelectSuggestion: (question: string) => void;
}

export function ChatListView({ onSelectSuggestion }: ChatListViewProps) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="pt-2 pb-6 gap-4"
      showsVerticalScrollIndicator={false}
    >
      {/* Routines Section */}
      <View className="gap-2 px-4">
        <View className="flex-row items-center px-3">
          <Text className="flex-1 font-josefin-regular text-body-sm text-white">
            Routines
          </Text>
          <Text className="text-base text-white/70 font-light">+</Text>
        </View>
        <View style={{ gap: 2 }}>
          {ROUTINES.map((routine) => (
            <View
              key={routine}
              className="bg-deep-crimson-700 rounded-xs border border-deep-crimson-700 px-3 py-3 flex-row items-center gap-2"
            >
              {/* folder icon placeholder */}
              <Text className="text-sm text-white/70 w-4 text-center">⊡</Text>
              <Text
                className="flex-1 font-josefin text-body-sm text-white"
                numberOfLines={1}
              >
                {routine}
              </Text>
              <Text className="text-xl text-white/50 leading-6">›</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Chats Section */}
      <View className="gap-2 px-4">
        <View className="flex-row items-center px-3">
          <Text className="flex-1 font-josefin-regular text-body-sm text-white">
            Chats
          </Text>
          <Text className="text-base text-white/70 font-light">+</Text>
        </View>
        <View className="gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <Pressable
              key={q}
              className="bg-deep-crimson-700 rounded-xs border border-deep-crimson-700 px-3 py-3 flex-row items-center gap-2 active:bg-[#730018] active:border-[#730018]"
              onPress={() => onSelectSuggestion(q)}
            >
              <Text
                className="flex-1 font-josefin text-body-sm text-white"
                numberOfLines={1}
              >
                {q}
              </Text>
              <Text className="text-xl text-white/50 leading-6">›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
