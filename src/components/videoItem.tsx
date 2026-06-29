import { Video } from "@/helpers/videoDB";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Text, TouchableOpacity, View } from "react-native";

export default function FeedItem({
  item,
  isActive,
  itemHeight,
}: {
  item: Video;
  isActive: boolean;
  itemHeight: number;
}) {
  const player = useVideoPlayer(item.video_url, (p) => {
    p.loop = true;
  });

  if (isActive) {
    player.play();
  } else {
    player.pause();
  }

  return (
    <View
      style={{ height: itemHeight }}
      className="bg-black items-center justify-center"
    >
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        nativeControls={false}
      />

      <View className="absolute bottom-16 right-4">
        <Text
          className="text-white text-2xl font-bold"
          style={{ textShadowColor: "#000", textShadowRadius: 4 }}
        >
          @{item.username}
        </Text>
      </View>

      <View className="absolute bottom-36 left-3 items-center gap-5">
        <TouchableOpacity className="items-center gap-1">
          <FontAwesome
            name={item.is_liked ? "heart" : "heart-o"}
            size={28}
            color={item.is_liked ? "#ef4444" : "#ffffff"}
          />
          <Text className="text-white text-xs">{item.likes_count}</Text>
        </TouchableOpacity>

        <View className="items-center gap-1">
          <Feather name="eye" size={26} color="#ffffff" />
          <Text className="text-white text-xs">{item.views_count}</Text>
        </View>

        <TouchableOpacity className="items-center gap-1">
          <FontAwesome name="comment" size={26} color="#ffffff" />
          <Text className="text-white text-xs">{item.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center gap-1">
          <FontAwesome
            name={item.is_saved ? "bookmark" : "bookmark-o"}
            size={26}
            color={item.is_saved ? "#facc15" : "#ffffff"}
          />
        </TouchableOpacity>

        <TouchableOpacity className="items-center gap-1">
          <Ionicons name="link" size={26} color="#ffffff" />
          <Text className="text-white text-xs">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
