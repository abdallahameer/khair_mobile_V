import Toast from "react-native-toast-message";
import { apiClient } from "./api";
import { User, Video } from "./videoDB";

type VideoInteractionAction = "like" | "save";
type RequestFn = (
  url: string,
  body?: Record<string, unknown>,
) => Promise<unknown>;
type VideoMutator = (data?: any, shouldRevalidate?: boolean) => Promise<any>;

export const updateSingleVideo = (
  videoId: string,
  updater: (v: Video) => Video,
  updateVideoInfo: VideoMutator,
) => {
  updateVideoInfo((currentData: any) => {
    if (!currentData) return currentData;

    if (Array.isArray(currentData)) {
      return currentData.map((page) => ({
        ...page,
        videos: page.videos.map((v: Video) =>
          v.id === videoId ? updater(v) : v,
        ),
      }));
    }

    if (typeof currentData === "object" && "id" in currentData) {
      return currentData.id === videoId
        ? updater(currentData as Video)
        : currentData;
    }

    return currentData;
  }, false);
};

const showLoginToast = () => {
  Toast.show({
    type: "info",
    text1: "Login required",
    text2: "You need to login first",
    visibilityTime: 3000,
  });
};

export const toggleVideoInteraction = async (
  item: Video,
  user: User | null | undefined,
  updateVideoInfo: VideoMutator,
  action: VideoInteractionAction,
  request: RequestFn = apiClient.post,
) => {
  if (!user) {
    showLoginToast();
    return;
  }

  const wasActive = action === "like" ? item.is_liked : item.is_saved;
  const isLike = action === "like";

  updateSingleVideo(
    item.id.toString(),
    (v) => {
      const nextValue = wasActive ? 0 : 1;

      if (isLike) {
        return {
          ...v,
          is_liked: nextValue,
          likes_count: wasActive ? v.likes_count - 1 : v.likes_count + 1,
        };
      }

      return {
        ...v,
        is_saved: nextValue,
      };
    },
    updateVideoInfo,
  );

  try {
    if (wasActive) {
      await apiClient.delete(`/api/videos/${item.id}/${action}`, {
        data: { user_id: user.id },
      });
    } else {
      await request(`/api/videos/${item.id}/${action}`, { user_id: user.id });
    }
  } catch {
    updateSingleVideo(
      item.id.toString(),
      (v) => {
        if (isLike) {
          return {
            ...v,
            is_liked: wasActive,
            likes_count: wasActive ? v.likes_count + 1 : v.likes_count - 1,
          };
        }

        return {
          ...v,
          is_saved: wasActive,
        };
      },
      updateVideoInfo,
    );
  }
};

export const toggleLikeVideo = (
  item: Video,
  user: User | null | undefined,
  updateVideoInfo: VideoMutator,
  request: RequestFn = apiClient.post,
) => toggleVideoInteraction(item, user, updateVideoInfo, "like", request);

export const toggleSaveVideo = (
  item: Video,
  user: User | null | undefined,
  updateVideoInfo: VideoMutator,
  request: RequestFn = apiClient.post,
) => toggleVideoInteraction(item, user, updateVideoInfo, "save", request);
