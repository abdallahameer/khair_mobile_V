import { useAuth } from "@/context/AuthContext";
import { triggerFeedRefresh } from "@/helpers/Feedrefresh";
import { VIDEO_CATEGORIES } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function UserCategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { post } = usePost();
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const categoriesHandler = (category: string) => {
    setCategoryList((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const handleClose = () => {
    router.replace("/(tabs)");
  };

  const handleSave = async () => {
    if (!user || categoryList.length === 0 || submitting) return;
    setSubmitting(true);

    try {
      await post(`/api/users/${user.id}/categories`, {
        categories: categoryList,
      });
      triggerFeedRefresh();
      router.replace("/(tabs)");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: err.message || "Please try again.",
        visibilityTime: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between p-3">
        <Text className="text-2xl font-bold text-white">Your interests</Text>
        <TouchableOpacity onPress={handleClose} disabled={submitting}>
          <Feather name="x" size={26} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 gap-3 p-3">
        <Text className="text-base text-gray-400">
          Choose the categories you'd like to see — pick as many as you want.
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {VIDEO_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => categoriesHandler(cat)}
              disabled={submitting}
              className={`px-4 py-2 rounded-full border ${
                categoryList.includes(cat)
                  ? "bg-red-600 border-red-600"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              <Text
                className={`text-sm ${
                  categoryList.includes(cat)
                    ? "text-white font-semibold"
                    : "text-gray-300"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="p-3">
        <TouchableOpacity
          onPress={handleSave}
          disabled={categoryList.length === 0 || submitting}
          className="items-center p-4 bg-red-600 rounded-xl"
          style={{
            opacity: categoryList.length === 0 || submitting ? 0.5 : 1,
          }}
        >
          <Text className="text-base font-semibold text-white">
            {submitting ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
