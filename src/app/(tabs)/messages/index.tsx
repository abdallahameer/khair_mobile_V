import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { ConversationListItem } from "@/helpers/videoDB";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useSWR from "swr";

export default function Messages() {
  const router = useRouter();
  const { user, loadingUser } = useAuth();

  const {
    data: conversations,
    isLoading,
    mutate,
  } = useSWR<ConversationListItem[]>(
    user ? `/api/conversations?user_id=${user.id}` : null,
    fetcher,
  );

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate]),
  );

  if (loadingUser || isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <Text className="text-gray-400">Login to see your messages</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pt-16 bg-black">
      <Text className="px-4 mb-4 text-2xl font-bold text-white">Messages</Text>

      <FlatList
        data={conversations ?? []}
        keyExtractor={(c) => c.id}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-gray-500">
            No conversations yet
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/messages/[conversationId]",
                params: {
                  conversationId: item.id,
                  otherUserId: item.other_user_id,
                  otherUsername: item.other_username,
                  otherProfileImage: item.other_profile_image ?? "",
                },
              })
            }
            className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-800"
          >
            {item.other_profile_image ? (
              <Image
                source={{ uri: item.other_profile_image }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-12 h-12 bg-gray-800 rounded-full">
                <Text className="text-lg font-bold text-white">
                  {item.other_username[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="font-semibold text-white">
                @{item.other_username}
              </Text>
              <Text className="text-sm text-gray-400" numberOfLines={1}>
                {item.last_message_text ?? ""}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
