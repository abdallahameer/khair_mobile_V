import VideoFeed from "@/components/VideoFeed";
import { useAuth } from "@/context/AuthContext";
import { apiClient, fetcher } from "@/helpers/api";
import { Video } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { ActivityIndicator, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
interface User {
  id: string;
  username: string;
  profile_image?: string | null;
}

export default function Home() {
  const { user } = useAuth();
  const {
    data: videos,
    mutate: updateVideoInfo,
    isLoading: isLoading,
  } = useSWR(
    user ? `/api/videos/approved?user_id=${user.id}` : `/api/videos/approved`,
    fetcher,
  );
  const { post } = usePost();

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

    try {
      if (item.is_liked) {
        await apiClient.delete(`/api/videos/${item.id}/like`, {
          data: { user_id: user.id },
        });
        updateVideoInfo();
      } else {
        await post(`/api/videos/${item.id}/like`, {
          user_id: user.id,
        });
        updateVideoInfo();
      }
    } catch {}
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

    try {
      if (item.is_saved) {
        await apiClient.delete(`/api/videos/${item.id}/save`, {
          data: { user_id: user.id },
        });
        updateVideoInfo();
      } else {
        await post(`/api/videos/${item.id}/save`, {
          user_id: user.id,
        });
        updateVideoInfo();
      }
    } catch {}
  };

  if (isLoading) {
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
    />
  );
}
