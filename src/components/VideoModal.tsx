import { fetcher } from "@/helpers/api";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/helpers/api";
import { toggleLikeVideo, toggleSaveVideo } from "@/helpers/functions";
import { Video } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import CommentsPanel from "./commentsPanel";

const { height: itemHeight } = Dimensions.get("screen");
const DESCRIPTION_PREVIEW_LENGTH = 30;

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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const { post } = usePost();
  const { user } = useAuth();
  const router = useRouter();
  const { data: video, mutate } = useSWR<Video>(
    videoId
      ? `/api/videos/${videoId}${currentUserId ? `?viewer_id=${currentUserId}` : ""}`
      : null,
    fetcher,
  );

  // Seed local follow state whenever the fetched video's server value changes
  useEffect(() => {
    if (video) {
      setIsFollowing(!!video.is_following);
    }
  }, [video?.is_following]);

  const description = video?.description ?? "";
  const isTruncatable = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const displayedDescription =
    isTruncatable && !showFullDescription
      ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
      : description;

  const player = useVideoPlayer(video?.video_url ?? "", (p) => {
    p.loop = true;
    if (video?.video_url) p.play();
  });

  console.log(video?.is_following);

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

  const goToProfile = () => {
    if (video?.user_id === user?.id) {
      router.replace(`/(tabs)/profile/profile_user`);
    } else {
      router.replace(`/${video?.user_id}`);
    }
  };

  const onComment = () => setOpenComments(true);

  const followingHandler = async () => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }

    if (!video) return;
    // Can't follow yourself
    if (video.user_id === user.id) return;
    if (followBusy) return;

    const wasFollowing = isFollowing;
    setFollowBusy(true);
    setIsFollowing(!wasFollowing); // optimistic

    try {
      if (wasFollowing) {
        await apiClient.delete(`/api/users/${video.user_id}/follow`, {
          data: { follower_id: user.id },
        });
      } else {
        await apiClient.post(`/api/users/${video.user_id}/follow`, {
          follower_id: user.id,
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

  const isOwnVideo = video?.user_id === user?.id;

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
        <TouchableWithoutFeedback
          onPress={() => {
            if (player.playing) {
              player.pause();
            } else {
              player.play();
            }
          }}
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
              @{video?.username}
            </Text>
          </TouchableOpacity>
          <Text className="text-white">{video?.category}</Text>
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
          {/* Avatar and follow badge are SIBLINGS under a plain View, not
              nested touchables — nesting them is what caused tapping the
              avatar to also fire the follow toggle in FeedItem. */}
          <View
            style={{ width: 56, height: 56 }}
            className="relative flex-row items-center justify-center"
          >
            <TouchableOpacity
              onPress={goToProfile}
              style={{ width: 56, height: 56 }}
            >
              {video?.profile_image ? (
                <Image
                  source={{ uri: video.profile_image }}
                  className="w-14 h-14 border-2 border-gray-700 rounded-full"
                />
              ) : (
                <View className="items-center justify-center w-14 h-14 bg-gray-800 border-2 border-gray-700 rounded-full">
                  <Text className="text-sm font-bold text-white">
                    {video?.username?.[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {video && !isOwnVideo && (
              <TouchableOpacity
                onPress={followingHandler}
                disabled={followBusy}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                className="absolute items-center justify-center w-6 h-6 bg-red-500 rounded-full -bottom-1 left-4"
              >
                <Feather
                  size={14}
                  color="#fff"
                  name={isFollowing ? "check" : "plus"}
                />
              </TouchableOpacity>
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
