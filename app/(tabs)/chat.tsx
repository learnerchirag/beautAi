import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-core-white">
      <View className="flex-1 items-center justify-center px-8 gap-2">
        <Text className="text-4xl mb-2">💬</Text>
        <Text className="font-josefin-bold text-2xl tracking-tight text-core-black">
          Chat
        </Text>
        <Text className="font-josefin text-body-md text-teal mb-1">
          Coming Soon
        </Text>
        <Text className="font-josefin-regular text-body-md text-grey-600 text-center leading-5">
          Chat with your AI beauty assistant, powered by Groq.
        </Text>
      </View>
    </SafeAreaView>
  );
}
