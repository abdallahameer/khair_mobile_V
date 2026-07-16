import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { usePost } from "@/hooks/Requests";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { scheduleOnRN } from "react-native-worklets";
import useSWR from "swr";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  username: string;
  profile_image: string | null;
}

export default function CommentsPanel({
  videoId,
  visible,
  onClose,
}: {
  videoId: string;
  visible: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { post } = usePost();
  const { user } = useAuth();
  const translateY = useSharedValue(800);

  const {
    data: comments,
    isLoading,
    mutate,
  } = useSWR<Comment[]>(
    visible ? `/api/videos/${videoId}/comments` : null,
    fetcher,
  );

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [visible, videoId]);

  const handleClose = () => {
    translateY.value = withTiming(800, { duration: 300 }, (finished) => {
      if (finished) {
        scheduleOnRN(onClose);
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSubmit = async () => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await post(`/api/videos/${videoId}/comments`, {
        user_id: user.id,
        text: text.trim(),
      });
      setText("");
      mutate();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={handleClose}
      />

      <Animated.View
        style={animatedStyle}
        className="absolute bottom-0 left-0 right-0 h-[70%] bg-gray-900 rounded-t-2xl"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <Text className="font-semibold text-white">
              Comments {comments?.length ? `(${comments.length})` : ""}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ padding: 16, gap: 16 }}
            ListEmptyComponent={
              !isLoading ? (
                <Text className="mt-8 text-center text-gray-500">
                  No comments yet — be the first!
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <View className="flex-row gap-3">
                <View className="items-center justify-center w-8 h-8 bg-gray-700 rounded-full">
                  <Text className="text-xs font-bold text-white">
                    {item.username[0].toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-white">
                    @{item.username}
                  </Text>
                  <Text className="text-sm text-gray-300">{item.text}</Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          />

          <View className="flex-row gap-2 p-4 border-t border-gray-700">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add a comment..."
              placeholderTextColor="#6b7280"
              className="flex-1 px-4 py-2 text-white bg-gray-800 rounded-full"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !text.trim()}
              className="items-center justify-center px-4 py-2 bg-red-600 rounded-full"
              style={{ opacity: submitting || !text.trim() ? 0.5 : 1 }}
            >
              <Text className="text-white">Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}
