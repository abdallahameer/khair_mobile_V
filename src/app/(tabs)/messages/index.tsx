import ConfirmationModal from "@/components/confirmationModal";
import { useAuth } from "@/context/AuthContext";
import { apiClient, fetcher, WS_BASE_URL } from "@/helpers/api";
import { ConversationListItem } from "@/helpers/videoDB";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

export default function Messages() {
  const router = useRouter();
  const { user, loadingUser } = useAuth();
  const [selectedConversation, setSelectedConversation] =
    useState<string>("null");
  const [openConfermationModal, setOpenConfermationModal] = useState(false);
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

  useEffect(() => {
    if (!user) return;

    let socket: WebSocket | null = null;
    let cancelled = false;

    const connect = () => {
      socket = new WebSocket(`${WS_BASE_URL}/api/users/${user.id}/inbox-ws`);

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "conversations_updated") {
            mutate();
          }
        } catch {}
      };

      socket.onclose = () => {
        if (!cancelled) {
          setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      socket?.close();
    };
  }, [user, mutate]);

  const deleteConversationsHandler = async () => {
    if (!user || !selectedConversation) return;

    try {
      await apiClient.delete(`/api/conversations/${selectedConversation}`, {
        data: { user_id: user.id },
      });
      mutate();
      Toast.show({ type: "success", text1: "conversation Deleted" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to delete conversation" });
    }
  };

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
            onLongPress={() => {
              setSelectedConversation(item.id);
              setOpenConfermationModal(true);
            }}
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
              <Text
                className={`font-semibold ${item.has_unread ? "text-white" : "text-gray-300"}`}
              >
                @{item.other_username}
              </Text>
              <Text
                className={`text-sm ${item.has_unread ? "text-white" : "text-gray-400"}`}
                numberOfLines={1}
              >
                {item.last_message_text ?? ""}
              </Text>
            </View>
            {!!item.has_unread && (
              <View className="w-3 h-3 bg-red-600 rounded-full" />
            )}
          </TouchableOpacity>
        )}
      />
      <ConfirmationModal
        confirmButtonText="Delete this conversation"
        cancelButtonText="Cancel"
        confirmationText="Delete Conversation"
        confirmFunc={deleteConversationsHandler}
        open={openConfermationModal}
        setOpen={setOpenConfermationModal}
      />
    </View>
  );
}
