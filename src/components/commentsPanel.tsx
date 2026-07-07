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
          <View className="flex-row items-center justify-between border-b border-gray-700 p-4">
            <Text className="text-white font-semibold">
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
                <Text className="text-gray-500 text-center mt-8">
                  No comments yet — be the first!
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <View className="flex-row gap-3">
                <View className="h-8 w-8 rounded-full bg-gray-700 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {item.username[0].toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium">
                    @{item.username}
                  </Text>
                  <Text className="text-gray-300 text-sm">{item.text}</Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          />

          <View className="flex-row gap-2 border-t border-gray-700 p-4">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add a comment..."
              placeholderTextColor="#6b7280"
              className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-white"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !text.trim()}
              className="bg-red-600 rounded-full px-4 py-2 items-center justify-center"
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
