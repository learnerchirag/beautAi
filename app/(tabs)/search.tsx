import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-core-white">
      <View className="flex-1 items-center justify-center px-8 gap-2">
        <Text className="text-4xl mb-2">🔍</Text>
        <Text className="font-josefin-bold text-2xl tracking-tight text-core-black">
          Search
        </Text>
        <Text className="font-josefin text-body-md text-teal mb-1">
          Coming Soon
        </Text>
        <Text className="font-josefin-regular text-body-md text-grey-600 text-center leading-5">
          Discover products, looks, and creators — all personalised for you.
        </Text>
      </View>
    </SafeAreaView>
  );
}
