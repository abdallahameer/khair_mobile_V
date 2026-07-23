import { useAuth } from "@/context/AuthContext";
import { apiClient, fetcher, WS_BASE_URL } from "@/helpers/api";
import { Message, MessagesPage } from "@/helpers/videoDB";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWRInfinite from "swr/infinite";

export default function ChatScreen({
  conversationId: initialConversationId,
  otherUserId,
  otherUsername,
  otherProfileImage,
}: {
  conversationId: string | null;
  otherUserId: string;
  otherUsername: string;
  otherProfileImage?: string | null;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setConversationId(initialConversationId);
  }, [initialConversationId]);

  const getKey = (pageIndex: number, previousPageData: MessagesPage | null) => {
    if (!conversationId) return null;
    if (previousPageData && !previousPageData.nextCursor) return null;

    const cursorParams =
      pageIndex === 0
        ? ""
        : `&cursor=${encodeURIComponent(previousPageData!.nextCursor!)}`;

    return `/api/conversations/${conversationId}/messages?limit=20${cursorParams}`;
  };

  const { data, size, setSize, isLoading } = useSWRInfinite<MessagesPage>(
    getKey,
    fetcher,
  );

  const historyMessages = data ? data.flatMap((page) => page.messages) : [];
  const isReachingEnd = data && data[data.length - 1]?.nextCursor === null;

  const loadMore = () => {
    if (!isLoading && !isReachingEnd) {
      setSize(size + 1);
    }
  };

  const allMessages = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of historyMessages) map.set(m.id, m);
    for (const m of liveMessages) map.set(m.id, m);
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [historyMessages, liveMessages]);

  useEffect(() => {
    if (!conversationId) return;

    let socket: WebSocket | null = null;
    let cancelled = false;

    const connect = () => {
      socket = new WebSocket(
        `${WS_BASE_URL}/api/conversations/${conversationId}/ws`,
      );
      wsRef.current = socket;

      socket.onmessage = (e) => {
        try {
          const message: Message = JSON.parse(e.data);
          setLiveMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
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
  }, [conversationId]);

  const handleSend = async () => {
    if (!user || !text.trim() || sending) return;

    const trimmedText = text.trim();
    setText("");
    setSending(true);

    try {
      if (!conversationId) {
        const { data: response } = await apiClient.post("/api/messages", {
          sender_id: user.id,
          other_user_id: otherUserId,
          text: trimmedText,
        });

        setConversationId(response.conversation_id);
        setLiveMessages((prev) => [...prev, response]);
      } else {
        const { data: response } = await apiClient.post(
          `/api/conversations/${conversationId}/messages`,
          { sender_id: user.id, text: trimmedText },
        );

        setLiveMessages((prev) => {
          if (prev.some((m) => m.id === response.id)) return prev;
          return [...prev, response];
        });
      }
    } catch {
      setText(trimmedText);
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <View
        className="flex-row items-center gap-3 px-4 pb-3 border-b border-gray-800"
        style={{ paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>

        {otherProfileImage ? (
          <Image
            source={{ uri: otherProfileImage }}
            className="rounded-full w-9 h-9"
          />
        ) : (
          <View className="items-center justify-center bg-gray-800 rounded-full w-9 h-9">
            <Text className="text-sm font-bold text-white">
              {otherUsername?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}

        <Text className="text-lg font-semibold text-white">
          @{otherUsername}
        </Text>
      </View>

      {isLoading && allMessages.length === 0 ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator color="#dc2626" size="large" />
        </View>
      ) : (
        <FlatList
          data={allMessages}
          keyExtractor={(m) => m.id}
          inverted
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-gray-500">
              No messages yet — say hello!
            </Text>
          }
          renderItem={({ item }) => {
            const isMine = item.sender_id === user?.id;
            return (
              <View
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  isMine ? "self-end bg-red-600" : "self-start bg-gray-800"
                }`}
              >
                <Text className="text-white">{item.text}</Text>
              </View>
            );
          }}
        />
      )}

      <View
        style={{
          transform: [{ translateY: -keyboardHeight + insets.bottom }],
          paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 12),
        }}
        className="flex-row gap-2 px-4 pt-3 bg-red-500 border-t border-gray-800"
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor="#6b7280"
          className="flex-1 px-4 py-10 text-white bg-gray-800 rounded-full"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !text.trim()}
          className="items-center justify-center px-4 py-2 bg-red-600 rounded-full"
          style={{ opacity: sending || !text.trim() ? 0.5 : 1 }}
        >
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
