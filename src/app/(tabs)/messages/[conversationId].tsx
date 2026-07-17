import { useLocalSearchParams } from "expo-router/build/hooks";
import { Text, View } from "react-native";

export default function Conversation() {
  const { conversationId } = useLocalSearchParams();
  return (
    <View className="items-center justify-center flex-1 bg-black">
      <Text className="text-xl text-white">{conversationId}</Text>
    </View>
  );
}
