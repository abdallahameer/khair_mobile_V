import { Video } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { useIsFocused } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, FlatList, ViewToken } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentsPanel from "./commentsPanel";
import FeedItem from "./videoItem";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface User {
  id: string;
  username: string;
  profile_image?: string | null;
}

export default function VideoFeed({
  videos,
  user,
  onLike,
  onSave,
}: {
  videos: Video[];
  user: User | null;
  onLike: (item: Video) => void;
  onSave: (item: Video) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsOpenFor, setCommentsOpenFor] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const itemHeight = SCREEN_HEIGHT - insets.top - insets.bottom;
  const { post } = usePost();

  const viewedVideos = useRef<Set<string>>(new Set());

  const handleView = async (videoId: string) => {
    if (viewedVideos.current.has(videoId)) return;

    if (!user) return;

    try {
      await post(`/api/videos/${videoId}/view`, {
        user_id: user.id,
      });
      viewedVideos.current.add(videoId);
    } catch {}
  };

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
    <>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <FeedItem
            item={item}
            isActive={index === activeIndex && isFocused}
            itemHeight={itemHeight}
            userId={user?.id ?? null}
            onLike={() => onLike(item)}
            onSave={() => onSave(item)}
            onComment={() => setCommentsOpenFor(item.id.toString())}
            onView={() => handleView(item.id.toString())}
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

      <CommentsPanel
        videoId={commentsOpenFor ?? ""}
        visible={commentsOpenFor !== null}
        onClose={() => setCommentsOpenFor(null)}
      />
    </>
  );
}
