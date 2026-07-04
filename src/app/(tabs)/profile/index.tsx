import { getCurrentUser } from "@/helpers/api";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function ProfileTab() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setChecking(true);

      const check = async () => {
        const user = await getCurrentUser();
        if (user) {
          router.replace(`/(tabs)/profile/user`);
        } else {
          setChecking(false);
        }
      };

      check();
    }, []),
  );

  if (checking) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator color="#dc2626" />
      </View>
    );
  }

  return (
    <View className="items-center justify-center flex-1 px-6 bg-black">
      <Text className="mb-2 text-2xl font-bold text-white">Khair</Text>
      <Text className="mb-8 text-sm text-center text-gray-400">
        Login to see your profile, liked and saved videos
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        className="items-center w-full py-3 mb-3 bg-blue-600 rounded-lg"
      >
        <Text className="font-medium text-white">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/register")}
        className="items-center w-full py-3 bg-gray-800 rounded-lg"
      >
        <Text className="font-medium text-white">Register</Text>
      </TouchableOpacity>
    </View>
  );
}
