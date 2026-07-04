import { VideoView, useVideoPlayer } from "expo-video";

import { Dimensions, TouchableOpacity } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GRID_ITEM_SIZE = SCREEN_WIDTH / 3;
export default function GridItem({
  video,
  onPress,
}: {
  video: any;
  onPress: () => void;
}) {
  const player = useVideoPlayer(video.video_url, (p) => {
    p.loop = true;
    p.muted = true;
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE }}
      className="border border-black"
    >
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        nativeControls={false}
      />
    </TouchableOpacity>
  );
}
