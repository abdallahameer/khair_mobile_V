import { useAuth } from "@/context/AuthContext";
import { apiClient, fetcher, WS_BASE_URL } from "@/helpers/api";
import { Message, MessagesPage } from "@/helpers/videoDB";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWRInfinite from "swr/infinite";
import ConfirmationModal from "./confirmationModal";
import EditMessageModal from "./EditMessageModal";
import MessageActionsModal from "./MessageActionsModal";
import TextInputComponent from "./TextInputComponent";

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

  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [OpenModal, setOpenModal] = useState(false);
  const [messageId, setMessageId] = useState<string>("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [editedMessages, setEditedMessages] = useState<
    Map<string, { text: string; edited_at: string }>
  >(new Map());
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
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

  const { data, size, setSize, isLoading, mutate } =
    useSWRInfinite<MessagesPage>(getKey, fetcher);

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

    for (const id of deletedIds) map.delete(id);

    for (const [id, edit] of editedMessages) {
      const existing = map.get(id);
      if (existing)
        map.set(id, {
          ...existing,
          text: edit.text,
          edited_at: edit.edited_at,
        });
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [historyMessages, liveMessages, deletedIds, editedMessages]);

  useEffect(() => {
    if (!conversationId || !user) return;

    apiClient
      .post(`/api/conversations/${conversationId}/read`, { user_id: user.id })
      .catch(() => {});
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId) return;

    let socket: WebSocket | null = null;
    let cancelled = false;

    const connect = () => {
      socket = new WebSocket(
        `${WS_BASE_URL}/api/conversations/${conversationId}/ws`,
      );

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          if (data.type === "message_deleted") {
            setLiveMessages((prev) => prev.filter((m) => m.id !== data.id));
            setDeletedIds((prev) => new Set(prev).add(data.id));
            return;
          }

          if (data.type === "message_updated") {
            setLiveMessages((prev) => {
              const exists = prev.some((m) => m.id === data.id);
              if (exists) {
                return prev.map((m) =>
                  m.id === data.id
                    ? { ...m, text: data.text, edited_at: data.edited_at }
                    : m,
                );
              }
              return prev;
            });
            setEditedMessages((prev) =>
              new Map(prev).set(data.id, {
                text: data.text,
                edited_at: data.edited_at,
              }),
            );
            return;
          }

          if (data.type === "conversation_deleted") {
            router.back();
            return;
          }

          const message: Message = data;
          setLiveMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });

          if (user && conversationId) {
            apiClient
              .post(`/api/conversations/${conversationId}/read`, {
                user_id: user.id,
              })
              .catch(() => {});
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

  const editMessageHandler = async (newText: string) => {
    if (!user || !conversationId || !selectedMessage) return;

    try {
      const { data: response } = await apiClient.patch(
        `/api/conversations/${conversationId}/messages/${selectedMessage.id}`,
        { user_id: user.id, text: newText },
      );

      setEditedMessages((prev) =>
        new Map(prev).set(selectedMessage.id, {
          text: response.text,
          edited_at: response.edited_at,
        }),
      );
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to edit message",
        visibilityTime: 3000,
      });
    }
  };

  const deleteMessageHandler = async () => {
    if (!user || !conversationId || !selectedMessage) return;

    try {
      await apiClient.delete(
        `/api/conversations/${conversationId}/messages/${selectedMessage.id}`,
        { data: { user_id: user.id } },
      );
      setDeletedIds((prev) => new Set(prev).add(selectedMessage.id));
      Toast.show({
        type: "success",
        text1: "message deleted",
        visibilityTime: 4000,
      });
    } catch {}
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
          onEndReachedThreshold={0.01}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-gray-500">
              No messages yet — say hello!
            </Text>
          }
          renderItem={({ item }) => {
            const isMine = item.sender_id === user?.id;
            return (
              <TouchableOpacity
                onLongPress={() => {
                  if (isMine) {
                    setSelectedMessage(item);
                    setActionsOpen(true);
                  }
                }}
              >
                <View
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMine ? "self-end bg-red-600" : "self-start bg-gray-800"
                  }`}
                >
                  <Text className="text-white">{item.text}</Text>
                  {item.edited_at && (
                    <Text className="mt-1 text-xs text-white/60">edited</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TextInputComponent
        text={text}
        buttonText="send"
        placeHolder="send a message"
        setText={setText}
        loading={sending}
        onSubmit={handleSend}
      />
      <MessageActionsModal
        open={actionsOpen}
        setOpen={setActionsOpen}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setOpenModal(true)}
      />

      {selectedMessage && (
        <EditMessageModal
          open={editOpen}
          setOpen={setEditOpen}
          initialText={selectedMessage.text}
          onSave={editMessageHandler}
        />
      )}

      <ConfirmationModal
        confirmationText="Delete message"
        confirmFunc={deleteMessageHandler}
        open={OpenModal}
        setOpen={setOpenModal}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </View>
  );
}
