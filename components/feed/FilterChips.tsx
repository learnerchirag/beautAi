import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { FEED_FILTERS, FeedFilter } from "@/lib/posts";

interface FilterChipsProps {
  selected: FeedFilter;
  onSelect: (filter: FeedFilter) => void;
}

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <View className="bg-core-white border-b border-grey-100">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-4 px-4 py-3"
      >
        {FEED_FILTERS.map((filter) => {
          const isSelected = filter === selected;
          return (
            <TouchableOpacity
              key={filter}
              className={[
                "h-8 px-3 py-2 rounded-xs items-center justify-center",
                isSelected
                  ? "bg-core-white border-[1.5px] border-deep-crimson"
                  : "bg-grey-100",
              ].join(" ")}
              onPress={() => onSelect(filter)}
              activeOpacity={0.7}
            >
              <Text className="font-josefin text-body-sm text-core-black capitalize">
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
