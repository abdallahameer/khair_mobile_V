import ChatScreen from "@/components/chatScreen";
import { useLocalSearchParams } from "expo-router";

export default function ChatByConversation() {
  const { conversationId, otherUserId, otherUsername, otherProfileImage } =
    useLocalSearchParams<{
      conversationId: string;
      otherUserId: string;
      otherUsername: string;
      otherProfileImage?: string;
    }>();

  return (
    <ChatScreen
      conversationId={conversationId}
      otherUserId={otherUserId}
      otherUsername={otherUsername}
      otherProfileImage={otherProfileImage ?? null}
    />
  );
}
