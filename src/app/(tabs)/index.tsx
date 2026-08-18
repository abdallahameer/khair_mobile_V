import VideoFeed from "@/components/VideoFeed";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { useFeedRefreshToken } from "@/helpers/Feedrefresh";
import { toggleLikeVideo, toggleSaveVideo } from "@/helpers/functions";
import { FeedPage, Video } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { ActivityIndicator, Text, View } from "react-native";
import useSWRInfinite from "swr/infinite";

export default function Home() {
  const { user, loadingUser } = useAuth();
  const { post } = usePost();
  const refreshToken = useFeedRefreshToken();

  const getKey = (pageIndex: number, previousPageData: FeedPage | null) => {
    if (loadingUser) return null;
    if (previousPageData && !previousPageData.hasMore) return null;

    const offset = pageIndex === 0 ? 0 : previousPageData!.nextOffset;
    const userParams = user ? `&user_id=${user.id}` : "";

    return `api/videos/approved?limit=5&offset=${offset}${userParams}&_r=${refreshToken}`;
  };

  const {
    data,
    size,
    setSize,
    isLoading,
    mutate: updateVideoInfo,
  } = useSWRInfinite<FeedPage>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const videos = data ? data.flatMap((page) => page.videos) : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isReachingEnd = data && data[data.length - 1]?.hasMore === false;

  const loadMore = () => {
    if (!isLoadingMore && !isReachingEnd) {
      setSize(size + 1);
    }
  };

  const handleLike = async (item: Video) => {
    await toggleLikeVideo(item, user, updateVideoInfo, post);
  };

  const handleSave = async (item: Video) => {
    await toggleSaveVideo(item, user, updateVideoInfo, post);
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
