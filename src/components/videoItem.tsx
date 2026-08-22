import ShareModal from "@/components/Sharemodal ";
import { apiClient } from "@/helpers/api";
import { Video } from "@/helpers/videoDB";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const DESCRIPTION_PREVIEW_LENGTH = 30;

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

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(!!item.is_following);
  const [followBusy, setFollowBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsFollowing(!!item.is_following);
  }, [item.is_following]);

  const description = item.description ?? "";
  const isTruncatable = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const displayedDescription =
    isTruncatable && !showFullDescription
      ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
      : description;

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
      router.push(`/(tabs)/profile/profile_user`);
    } else {
      router.push(`/${item.user_id}`);
    }
  };

  const followingHandler = async () => {
    if (!userId) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }

    // Can't follow yourself
    if (item.user_id === userId) return;
    if (followBusy) return;

    const wasFollowing = isFollowing;
    setFollowBusy(true);
    setIsFollowing(!wasFollowing); // optimistic

    try {
      if (wasFollowing) {
        await apiClient.delete(`/api/users/${item.user_id}/follow`, {
          data: { follower_id: userId },
        });
      } else {
        await apiClient.post(`/api/users/${item.user_id}/follow`, {
          follower_id: userId,
        });
      }
    } catch {
      setIsFollowing(wasFollowing); // rollback
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        visibilityTime: 3000,
      });
    } finally {
      setFollowBusy(false);
    }
  };

  const isOwnVideo = item.user_id === userId;
  return (
    <View
      style={{ height: itemHeight }}
      className="flex items-end justify-center h-full bg-black"
    >
      <TouchableWithoutFeedback
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
      </TouchableWithoutFeedback>
      <View
        pointerEvents="box-none"
        className="absolute flex-col items-end gap-2 bottom-32 right-4"
        style={{ maxWidth: 240 }}
      >
        <TouchableOpacity onPress={goToProfile}>
          <Text
            className="text-lg font-bold text-white"
            style={{ textShadowColor: "#000", textShadowRadius: 4 }}
          >
            @{item.username}
          </Text>
        </TouchableOpacity>
        {description.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              isTruncatable && setShowFullDescription((prev) => !prev)
            }
            activeOpacity={isTruncatable ? 0.7 : 1}
          >
            <Text
              className="text-white"
              style={{ textShadowColor: "#000", textShadowRadius: 4 }}
            >
              {displayedDescription}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        pointerEvents="box-none"
        className="absolute items-center gap-5 bottom-36 left-3"
      >
        <TouchableOpacity onPress={goToProfile}>
          {item.profile_image ? (
            <View className="relative items-center justify-center w-10 h-10">
              <Image
                source={{ uri: item.profile_image }}
                className="w-14 h-14 border-2 border-gray-700 rounded-full"
              />
              {!isOwnVideo && (
                <TouchableOpacity
                  onPress={followingHandler}
                  disabled={followBusy}
                  className="absolute items-center justify-center w-6 h-6 bg-red-500 rounded-full -bottom-4"
                >
                  <Feather
                    size={14}
                    color="#fff"
                    name={isFollowing ? "check" : "plus"}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="relative items-center justify-center w-14 h-14 bg-gray-800 border-2 border-gray-700 rounded-full">
              <Text className="text-sm font-bold text-white">
                {item.username[0].toUpperCase()}
              </Text>
              {!isOwnVideo && (
                <TouchableOpacity
                  onPress={followingHandler}
                  disabled={followBusy}
                  className="absolute items-center justify-center w-6 h-6 bg-red-500 rounded-full -bottom-4"
                >
                  <Feather
                    size={14}
                    color="#fff"
                    name={isFollowing ? "check" : "plus"}
                  />
                </TouchableOpacity>
              )}
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
          onPress={() => setShowShareModal(true)}
          className="items-center gap-1"
        >
          <Ionicons name="link" size={26} color="#ffffff" />
          <Text className="text-xs text-white">Share</Text>
        </TouchableOpacity>
      </View>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoId={String(item.id)}
        userId={userId}
        videoUrl={item.video_url}
        withTapbar={false}
      />
    </View>
  );
}
