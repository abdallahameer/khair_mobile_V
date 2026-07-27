import ChatScreen from "@/components/chatScreen";
import { useAuth } from "@/context/AuthContext";
import { apiClient, fetcher } from "@/helpers/api";
import { UserProfileType } from "@/helpers/videoDB";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import useSWR from "swr";

export default function ChatByUser() {
  const { otherUserId } = useLocalSearchParams<{ otherUserId: string }>();
  const { user, loadingUser } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [checkingConversation, setCheckingConversation] = useState(true);

  const { data: otherUserData, isLoading: isLoadingUser } =
    useSWR<UserProfileType>(
      otherUserId ? `/api/users/${otherUserId}` : null,
      fetcher,
    );

  useEffect(() => {
    if (!user || !otherUserId) return;

    const checkExisting = async () => {
      setCheckingConversation(true);
      try {
        const { data } = await apiClient.get("/api/conversations/find", {
          params: { user_id: user.id, other_user_id: otherUserId },
        });
        setConversationId(data.id);
      } catch {
        setConversationId(null);
      } finally {
        setCheckingConversation(false);
      }
    };

    checkExisting();
  }, [user, otherUserId]);

  if (loadingUser || isLoadingUser || checkingConversation || !otherUserData) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  return (
    <ChatScreen
      conversationId={conversationId}
      otherUserId={otherUserId}
      otherUsername={otherUserData.user.username}
      otherProfileImage={otherUserData.user.profile_image}
    />
  );
}
