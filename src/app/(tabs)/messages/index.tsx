import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Messages() {
  const router = useRouter();
  return (
    <View className="items-center justify-center flex-1 bg-black">
      <Text className="text-xl text-white">Will be ready</Text>
      <Button
        onPress={() => router.replace("/(tabs)/messages/1")}
        title="conversation 1"
      />
      <Button
        onPress={() => router.replace("/(tabs)/messages/2")}
        title="conversation 2"
      />
      <Button
        onPress={() => router.replace("/(tabs)/messages/3")}
        title="conversation 3"
      />
    </View>
  );
}
