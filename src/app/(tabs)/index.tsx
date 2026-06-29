import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import VideoFeed from "../../components/VideoFeed";
import { fetcher, getCurrentUser } from "../../helpers/api";
import { Video } from "../../helpers/videoDB";

export default function Home() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const user = await getCurrentUser();
        const url = user?.id
          ? `/api/videos/approved?user_id=${user.id}`
          : `/api/videos/approved`;

        const data = await fetcher(url);
        setVideos(data);
      } catch (err) {
        console.error("Failed to load feed:", err);
        setError("Could not load videos");
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">{error}</Text>
      </View>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">No videos available</Text>
      </View>
    );
  }

  return <VideoFeed videos={videos} />;
}
