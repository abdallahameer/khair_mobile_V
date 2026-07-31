import { Video } from "@/helpers/videoDB";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
export default function FeedItem({
  item,
  isActive,
  itemHeight,
  onLike,
  onSave,
  onComment,
  onView,
  userId,
}: {
  item: Video;
  isActive: boolean;
  itemHeight: number;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
  onView: () => void;
  userId: string | null;
}) {
  const router = useRouter();
  const player = useVideoPlayer(item.video_url, (p) => {
    p.loop = true;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isActive) {
      player.replay();
    } else {
      player.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setTimeout(() => {
        onView();
      }, 5000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  const goToProfile = () => {
    if (item.user_id === userId) {
      router.replace(`/(tabs)/profile/user`);
    } else {
      router.replace(`/${item.user_id}`);
    }
  };

  return (
    <View
      style={{ height: itemHeight }}
      className="flex items-end justify-center bg-black "
    >
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

      <TouchableOpacity
        onPress={goToProfile}
        className="absolute flex-row items-center gap-2 bottom-32 right-4"
      >
        <Text
          className="text-lg font-bold text-white"
          style={{ textShadowColor: "#000", textShadowRadius: 4 }}
        >
          @{item.username}
        </Text>
      </TouchableOpacity>

      <View className="absolute items-center gap-5 bottom-36 left-3">
        <TouchableOpacity onPress={goToProfile}>
          {item.profile_image ? (
            <Image
              source={{ uri: item.profile_image }}
              className="w-10 h-10 border-2 border-gray-700 rounded-full"
            />
          ) : (
            <View className="items-center justify-center w-10 h-10 bg-gray-800 border-2 border-gray-700 rounded-full">
              <Text className="text-sm font-bold text-white">
                {item.username[0].toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onLike} className="items-center gap-1">
          <FontAwesome
            name={item.is_liked ? "heart" : "heart-o"}
            size={28}
            color={item.is_liked ? "#ef4444" : "#ffffff"}
          />
          <Text className="text-xs text-white">{item.likes_count}</Text>
        </TouchableOpacity>

        <View className="items-center gap-1">
          <Feather name="eye" size={26} color="#ffffff" />
          <Text className="text-xs text-white">{item.views_count}</Text>
        </View>

        <TouchableOpacity onPress={onComment} className="items-center gap-1">
          <FontAwesome name="comment" size={26} color="#ffffff" />
          <Text className="text-xs text-white">{item.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSave} className="items-center gap-1">
          <FontAwesome
            name={item.is_saved ? "bookmark" : "bookmark-o"}
            size={26}
            color={item.is_saved ? "#facc15" : "#ffffff"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            await Clipboard.setStringAsync(
              `https://khair.live/singleVideo/${item.id}`,
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
  );
}
