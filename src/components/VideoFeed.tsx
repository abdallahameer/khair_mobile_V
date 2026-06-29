import { useRef, useState } from "react";
import { Dimensions, FlatList, ViewToken } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video } from "../helpers/videoDB";
import FeedItem from "./videoItem";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function VideoFeed({ videos }: { videos: Video[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const itemHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 51,
  }).current;

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <FeedItem
          item={item}
          isActive={index === activeIndex}
          itemHeight={itemHeight}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(_, index) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      })}
      snapToInterval={itemHeight}
      decelerationRate="fast"
    />
  );
}
