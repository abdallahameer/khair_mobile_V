import CategoryChips from "@/components/CategoryChips";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { triggerFeedRefresh } from "@/helpers/Feedrefresh";
import { usePost } from "@/hooks/Requests";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

export default function UserPreferedCategories({
  openCategory,
  onCloseCategory,
}: {
  openCategory: boolean;
  onCloseCategory: () => void;
}) {
  const { user } = useAuth();
  const { post } = usePost();
  const router = useRouter();
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useSWR<{ categories: string[] }>(
    openCategory && user ? `/api/users/${user.id}/categories` : null,
    fetcher,
  );

  useEffect(() => {
    if (data) {
      setCategoryList(data.categories);
    }
  }, [data]);

  const toggleCategory = (category: string) => {
    setCategoryList((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const handleSave = async () => {
    if (!user || categoryList.length === 0 || submitting) return;
    setSubmitting(true);

    try {
      await post(`/api/users/${user.id}/categories`, {
        categories: categoryList,
      });

      triggerFeedRefresh();

      Toast.show({
        type: "success",
        text1: "Interests updated",
        visibilityTime: 2000,
      });

      onCloseCategory();
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
    <Modal
      animationType="slide"
      visible={openCategory}
      onRequestClose={onCloseCategory}
    >
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-row items-center justify-between p-3">
          <Text className="text-2xl font-bold text-white">
            Update interests
          </Text>
          <TouchableOpacity onPress={onCloseCategory} disabled={submitting}>
            <Feather name="x" size={26} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator color="#dc2626" size="large" />
          </View>
        ) : (
          <View className="flex-1 gap-3 p-3">
            <Text className="text-base text-gray-400">
              Choose the categories you'd like to see — pick as many as you
              want.
            </Text>
            <CategoryChips
              selected={categoryList}
              onToggle={toggleCategory}
              disabled={submitting}
            />
          </View>
        )}

        <View className="p-3">
          <TouchableOpacity
            onPress={handleSave}
            disabled={categoryList.length === 0 || submitting || isLoading}
            className="items-center p-4 bg-red-600 rounded-xl"
            style={{
              opacity:
                categoryList.length === 0 || submitting || isLoading ? 0.5 : 1,
            }}
          >
            <Text className="text-base font-semibold text-white">
              {submitting ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
