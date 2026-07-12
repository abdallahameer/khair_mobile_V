import VideoFeed from "@/components/VideoFeed";
import { useAuth } from "@/context/AuthContext";
import { apiClient, fetcher } from "@/helpers/api";
import { Video, VideosPage } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { ActivityIndicator, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWRInfinite from "swr/infinite";

export default function Home() {
  const { user, loadingUser } = useAuth();
  const { post } = usePost();

  const getKey = (pageIndex: number, previousPageData: VideosPage) => {
    if (loadingUser) return;

    const cursorParams =
      pageIndex == 0
        ? ""
        : `&cursor=${encodeURIComponent(previousPageData!.nextCursor!)}`;
    const userParams = user ? `&user_id=${user.id}` : "";

    return `api/videos/approved?limit=5${cursorParams}${userParams}`;
  };

  const {
    data,
    size,
    setSize,
    isLoading,
    mutate: updateVideoInfo,
  } = useSWRInfinite<VideosPage>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const videos = data ? data.flatMap((page) => page.videos) : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isReachingEnd = data && data[data.length - 1]?.nextCursor === null;

  const loadMore = () => {
    if (!isLoadingMore && !isReachingEnd) {
      setSize(size + 1);
    }
  };

  const updateSingleVideo = (videoId: string, updater: (v: Video) => Video) => {
    updateVideoInfo((currentData: VideosPage[] | undefined) => {
      return currentData?.map((page) => ({
        ...page,
        videos: page.videos.map((v) => (v.id === videoId ? updater(v) : v)),
      }));
    }, false);
  };

  const handleLike = async (item: Video) => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }

    const wasLiked = item.is_liked;

    updateSingleVideo(item.id.toString(), (v) => ({
      ...v,
      is_liked: wasLiked ? 0 : 1,
      likes_count: wasLiked ? v.likes_count - 1 : v.likes_count + 1,
    }));

    try {
      if (wasLiked) {
        await apiClient.delete(`/api/videos/${item.id}/like`, {
          data: { user_id: user.id },
        });
      } else {
        await post(`/api/videos/${item.id}/like`, { user_id: user.id });
      }
    } catch {
      updateSingleVideo(item.id.toString(), (v) => ({
        ...v,
        is_liked: wasLiked,
        likes_count: wasLiked ? v.likes_count + 1 : v.likes_count - 1,
      }));
    }
  };

  const handleSave = async (item: Video) => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }

    const wasSaved = item.is_saved;

    updateSingleVideo(item.id.toString(), (v) => ({
      ...v,
      is_saved: wasSaved ? 0 : 1,
    }));

    try {
      if (wasSaved) {
        await apiClient.delete(`/api/videos/${item.id}/save`, {
          data: { user_id: user.id },
        });
      } else {
        await post(`/api/videos/${item.id}/save`, { user_id: user.id });
      }
    } catch {
      updateSingleVideo(item.id.toString(), (v) => ({
        ...v,
        is_saved: wasSaved,
      }));
    }
  };

  if ((isLoading || loadingUser) && videos.length === 0) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <Text className="text-white">No videos available</Text>
      </View>
    );
  }

  return (
    <VideoFeed
      videos={videos}
      user={user}
      onLike={handleLike}
      onSave={handleSave}
      onEndReached={loadMore}
    />
  );
}
