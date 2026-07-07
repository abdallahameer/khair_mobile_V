import { apiClient, fetcher } from "@/helpers/api";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";

import { usePost } from "@/hooks/Requests";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import CommentsPanel from "./commentsPanel";
export default function VideoModal({
  videoId,
  currentUserId,
  onClose,
}: {
  videoId: string;
  currentUserId?: string | null;
  onClose: () => void;
}) {
  const [openComments, setOpenComments] = useState(false);
  const { post } = usePost();
  const { data: video, mutate } = useSWR(
    videoId
      ? `/api/videos/${videoId}${currentUserId ? `?viewer_id=${currentUserId}` : ""}`
      : null,
    fetcher,
  );

  const player = useVideoPlayer(video?.video_url ?? "", (p) => {
    p.loop = true;
    if (video?.video_url) p.play();
  });

  useEffect(() => {
    if (video?.video_url) {
      player.play();
    }
  }, [video?.video_url]);

  const handleLike = async () => {
    if (!currentUserId) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }
    try {
      if (video?.is_liked) {
        await apiClient.delete(`/api/videos/${videoId}/like`, {
          data: { user_id: currentUserId },
        });
      } else {
        await post(`/api/videos/${videoId}/like`, {
          user_id: currentUserId,
        });
      }
      mutate();
    } catch {}
  };

  const handleSave = async () => {
    if (!currentUserId) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }
    try {
      if (video?.is_saved) {
        await apiClient.delete(`/api/videos/${videoId}/save`, {
          data: { user_id: currentUserId },
        });
      } else {
        await post(`/api/videos/${videoId}/save`, {
          user_id: currentUserId,
        });
      }
      mutate();
    } catch {}
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        {!video ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator color="#dc2626" size="large" />
          </View>
        ) : (
          <>
            <VideoView
              player={player}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              nativeControls={false}
            />

            <TouchableOpacity
              onPress={onClose}
              className="absolute p-2 rounded-full top-12 right-4 bg-black/40"
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
              }}
              className="absolute flex-row items-center gap-2 bottom-24 right-4"
            >
              <Text
                className="text-lg font-bold text-white"
                style={{ textShadowColor: "#000", textShadowRadius: 4 }}
              >
                @{video.username}
              </Text>
            </TouchableOpacity>

            <View className="absolute items-center gap-5 bottom-36 left-3">
              <TouchableOpacity
                onPress={handleLike}
                className="items-center gap-1"
              >
                <Ionicons
                  name={video.is_liked ? "heart" : "heart-outline"}
                  size={28}
                  color={video.is_liked ? "#ef4444" : "#ffffff"}
                />
                <Text className="text-xs text-white">{video.likes_count}</Text>
              </TouchableOpacity>

              <View className="items-center gap-1">
                <Ionicons name="eye-outline" size={26} color="#ffffff" />
                <Text className="text-xs text-white">{video.views_count}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setOpenComments(true)}
                className="items-center gap-1"
              >
                <FontAwesome name="comment" size={26} color="#ffffff" />
                <Text className="text-xs text-white">
                  {video.comments_count}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                className="items-center gap-1"
              >
                <Ionicons
                  name={video.is_saved ? "bookmark" : "bookmark-outline"}
                  size={26}
                  color={video.is_saved ? "#facc15" : "#ffffff"}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <CommentsPanel
        visible={openComments}
        videoId={videoId}
        onClose={() => setOpenComments(false)}
      />
    </Modal>
  );
}
