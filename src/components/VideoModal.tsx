import { fetcher } from "@/helpers/api";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { toggleLikeVideo, toggleSaveVideo } from "@/helpers/functions";
import { Video } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import CommentsPanel from "./commentsPanel";

const { height: itemHeight } = Dimensions.get("window");
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
  const { user } = useAuth();
  const router = useRouter();
  const { data: video, mutate } = useSWR<Video>(
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
    if (video) {
      await toggleLikeVideo(video, user, mutate, post);
    }
  };

  const handleSave = async () => {
    if (video) {
      await toggleSaveVideo(video, user, mutate, post);
    }
  };

  const onComment = () => setOpenComments(true);

  return (
    <View className="flex-1">
      <View
        style={{ height: itemHeight }}
        className="flex items-end justify-center bg-black "
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute z-50 p-2 rounded-full top-12 right-4 bg-black/40"
        >
          <Ionicons name="close" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Pressable
          onPress={() => {
            if (player.playing) {
              player.pause();
            } else {
              player.play();
            }
          }}
          style={{ width: "100%", height: itemHeight }}
        >
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            nativeControls={false}
          />
        </Pressable>

        <TouchableOpacity className="absolute flex-row items-center gap-2 bottom-32 right-4">
          <Text
            className="text-lg font-bold text-white"
            style={{ textShadowColor: "#000", textShadowRadius: 4 }}
          >
            @{video?.username}
          </Text>
        </TouchableOpacity>

        <View className="absolute items-center gap-5 bottom-36 left-3">
          <View>
            {video?.profile_image ? (
              <Image
                source={{ uri: video?.profile_image }}
                className="w-10 h-10 border-2 border-gray-700 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-10 h-10 bg-gray-800 border-2 border-gray-700 rounded-full">
                <Text className="text-sm font-bold text-white">
                  {video?.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleLike} className="items-center gap-1">
            <FontAwesome
              name={video?.is_liked ? "heart" : "heart-o"}
              size={28}
              color={video?.is_liked ? "#ef4444" : "#ffffff"}
            />
            <Text className="text-xs text-white">{video?.likes_count}</Text>
          </TouchableOpacity>

          <View className="items-center gap-1">
            <Feather name="eye" size={26} color="#ffffff" />
            <Text className="text-xs text-white">{video?.views_count}</Text>
          </View>

          <TouchableOpacity onPress={onComment} className="items-center gap-1">
            <FontAwesome name="comment" size={26} color="#ffffff" />
            <Text className="text-xs text-white">{video?.comments_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} className="items-center gap-1">
            <FontAwesome
              name={video?.is_saved ? "bookmark" : "bookmark-o"}
              size={26}
              color={video?.is_saved ? "#facc15" : "#ffffff"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(
                `https://khair.live/singleVideo/${video?.id}`,
              );
              Toast.show({
                type: "success",
                text1: "Copied to clipboard",
                text2: "Video link has been copied.",
              });
            }}
            className="items-center gap-1"
          >
            <Ionicons name="link" size={26} color="#ffffff" />
            <Text className="text-xs text-white">Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CommentsPanel
        visible={openComments}
        videoId={videoId}
        withTapbar={false}
        onClose={() => setOpenComments(false)}
      />
    </View>
  );
}
