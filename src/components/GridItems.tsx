import { useVideoPlayer, VideoView } from "expo-video";
import { Dimensions, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
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
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          width: GRID_ITEM_SIZE,
          height: GRID_ITEM_SIZE,
        }}
      >
        <View pointerEvents="none" style={{ width: "100%", height: "100%" }}>
          <VideoView
            player={player}
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit="contain"
            nativeControls={false}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
