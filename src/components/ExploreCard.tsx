import { Video } from "@/helpers/videoDB";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH / 2 - 12; // 2 columns, minus gutter padding

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

export default function ExploreCard({
  video,
  onPress,
}: {
  video: Video;
  onPress: () => void;
}) {
  const player = useVideoPlayer(video.video_url, (p) => {
    p.pause();
  });

  return (
    <TouchableOpacity onPress={onPress} style={{ width: CARD_WIDTH }}>
      <View className="relative mb-2 overflow-hidden rounded-xl bg-neutral-900">
        <View pointerEvents="none" style={{ width: "100%", height: 200 }}>
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="fill"
            nativeControls={false}
          />
        </View>

        {/* Like count badge */}
        <View
          pointerEvents="none"
          className="absolute flex-row items-center px-2 py-1 rounded-full top-2 left-2 bg-black/50"
        >
          <Ionicons name="heart" size={12} color="#ffffff" />
          <Text className="ml-1 text-xs text-white">
            {formatCount(video.likes_count)}
          </Text>
        </View>

        {/* Uploader overlay */}
        <View
          pointerEvents="none"
          className="absolute bottom-0 right-0 flex-row items-center px-2 py-2 left-4"
        >
          {video.profile_image ? (
            <Image
              source={{ uri: video.profile_image }}
              className="w-5 h-5 mr-1 rounded-full bg-neutral-700"
            />
          ) : (
            <View className="flex-row items-center justify-center w-5 h-5 mr-1 rounded-full bg-neutral-700">
              <Text className="text-sm font-bold text-white">
                {video?.username?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-xs text-white" numberOfLines={1}>
            {video.username}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
