import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import DashboardIcon from "@/assets/icons/Dashboard";
import { FEED_FILTERS, FeedFilter } from "@/lib/posts";
import { ActionButton } from "../buttons/ActionButton";

interface FilterChipsProps {
  selected: FeedFilter;
  onSelect: (filter: FeedFilter) => void;
}

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <View className="bg-core-white border-b border-grey-100 flex-row items-center gap-2 px-4">
      <ActionButton
        suffixIcon={<DashboardIcon color="black" />}
        onPress={() => {}}
        containerClassName="rounded-full items-center justify-center px-2 py-2 bg-grey-100"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-2 py-3"
      >
        {FEED_FILTERS.map((filter) => {
          const isSelected = filter === selected;
          return (
            <TouchableOpacity
              key={filter}
              className={[
                "px-3 py-2 rounded-xs items-center justify-center border-[1.5px]",
                isSelected
                  ? "bg-core-white border-deep-crimson"
                  : "bg-grey-100 border-transparent",
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
