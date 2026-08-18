import GridItem from "@/components/GridItems";
import UserPreferedCategories from "@/components/userPreferedCategories";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { UserProfileType, VideosPage } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Popover from "react-native-popover-view";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function OwnProfileScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"videos" | "liked" | "saved">("videos");
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const menuAnchor = useRef(null);
  const { post } = usePost();
  const { user, logout, loadingUser } = useAuth();
  const currentUserId = user?.id ?? null;

  const getVideosKey = (
    pageIndex: number,
    previousPageData: VideosPage | null,
  ) => {
    if (loadingUser || !user) return null;
    if (tab !== "videos") return null;
    if (previousPageData && !previousPageData.nextCursor) return null;

    const cursorParams =
      pageIndex === 0
        ? ""
        : `&cursor=${encodeURIComponent(previousPageData!.nextCursor!)}`;

    return `/api/users/${user.id}/videos?limit=10&viewer_id=${user.id}${cursorParams}`;
  };

  const {
    data: videosData,
    size: videosSize,
    setSize: setVideosSize,
    isLoading: isLoadingVideos,
  } = useSWRInfinite<VideosPage>(getVideosKey, fetcher);

  const ownVideos = videosData ? videosData.flatMap((page) => page.videos) : [];
  const isLoadingMoreVideos =
    isLoadingVideos ||
    (videosSize > 0 &&
      videosData &&
      typeof videosData[videosSize - 1] === "undefined");
  const isVideosEnd =
    videosData && videosData[videosData.length - 1]?.nextCursor === null;

  const loadMoreVideos = () => {
    if (!isLoadingMoreVideos && !isVideosEnd) {
      setVideosSize(videosSize + 1);
    }
  };

  const getLikedKey = (
    pageIndex: number,
    previousPageData: VideosPage | null,
  ) => {
    if (loadingUser || !user) return null;
    if (tab !== "liked") return null;
    if (previousPageData && !previousPageData.nextCursor) return null;

    const cursorParams =
      pageIndex === 0
        ? ""
        : `&cursor=${encodeURIComponent(previousPageData!.nextCursor!)}`;

    return `/api/users/${user.id}/liked-videos?limit=10${cursorParams}`;
  };

  const {
    data: likedData,
    size: likedSize,
    setSize: setLikedSize,
    isLoading: isLoadingLiked,
  } = useSWRInfinite<VideosPage>(getLikedKey, fetcher);

  const likedVideos = likedData ? likedData.flatMap((page) => page.videos) : [];
  const isLoadingMoreLiked =
    isLoadingLiked ||
    (likedSize > 0 &&
      likedData &&
      typeof likedData[likedSize - 1] === "undefined");
  const isLikedEnd =
    likedData && likedData[likedData.length - 1]?.nextCursor === null;

  const loadMoreLiked = () => {
    if (!isLoadingMoreLiked && !isLikedEnd) {
      setLikedSize(likedSize + 1);
    }
  };

  const getSavedKey = (
    pageIndex: number,
    previousPageData: VideosPage | null,
  ) => {
    if (loadingUser || !user) return null;
    if (tab !== "saved") return null;
    if (previousPageData && !previousPageData.nextCursor) return null;

    const cursorParams =
      pageIndex === 0
        ? ""
        : `&cursor=${encodeURIComponent(previousPageData!.nextCursor!)}`;

    return `/api/users/${user.id}/saved-videos?limit=10${cursorParams}`;
  };

  const {
    data: savedData,
    size: savedSize,
    setSize: setSavedSize,
    isLoading: isLoadingSaved,
  } = useSWRInfinite<VideosPage>(getSavedKey, fetcher);

  const savedVideos = savedData ? savedData.flatMap((page) => page.videos) : [];
  const isLoadingMoreSaved =
    isLoadingSaved ||
    (savedSize > 0 &&
      savedData &&
      typeof savedData[savedSize - 1] === "undefined");
  const isSavedEnd =
    savedData && savedData[savedData.length - 1]?.nextCursor === null;

  const loadMoreSaved = () => {
    if (!isLoadingMoreSaved && !isSavedEnd) {
      setSavedSize(savedSize + 1);
    }
  };

  const videosToDisplay =
    tab === "videos" ? ownVideos : tab === "liked" ? likedVideos : savedVideos;

  const loadMore =
    tab === "videos"
      ? loadMoreVideos
      : tab === "liked"
        ? loadMoreLiked
        : loadMoreSaved;

  const isLoadingCurrentTab =
    tab === "videos"
      ? isLoadingMoreVideos
      : tab === "liked"
        ? isLoadingMoreLiked
        : isLoadingMoreSaved;

  const {
    data: profileData,
    isLoading,
    mutate,
  } = useSWR<UserProfileType>(
    currentUserId ? `/api/users/${currentUserId}` : null,
    fetcher,
  );

  const handleImageUpload = async () => {
    if (!currentUserId) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "warning",
        text1: "Permission required",
        text2: "Permission required to access your photos",
        visibilityTime: 3000,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      const file = result.assets[0];
      const formData = new FormData();
      formData.append("image", {
        uri: file.uri,
        name: file.fileName ?? "profile.jpg",
        type: file.mimeType ?? "image/jpeg",
      } as any);
      formData.append("user_id", currentUserId);

      await post("/api/users/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      mutate();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to upload image",
        visibilityTime: 3000,
      });
    } finally {
    }
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    router.replace("/(tabs)/profile");
  };

  const handleOpenCategories = () => {
    setShowMenu(false);
    setShowCategoryModal(true);
  };

  if (isLoading || !profileData) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View>
        <View className="items-center pt-10 pb-4">
          <View className="flex-row items-center justify-between w-full px-4">
            <Popover
              isVisible={showMenu}
              onRequestClose={() => setShowMenu(false)}
              from={
                <TouchableOpacity
                  ref={menuAnchor}
                  onPress={() => setShowMenu(true)}
                >
                  <Feather name="more-vertical" size={24} color="white" />
                </TouchableOpacity>
              }
              popoverStyle={{
                backgroundColor: "#18181b",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#27272a",
              }}

              backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <View className="w-48 py-1">
                <TouchableOpacity
                  onPress={handleOpenCategories}
                  className="flex-row items-center gap-3 px-4 py-3"
                >
                  <Feather name="sliders" size={18} color="#d1d5db" />
                  <Text className="text-sm text-gray-200">
                    Update interests
                  </Text>
                </TouchableOpacity>

                <View className="h-px mx-2 bg-gray-800" />

                <TouchableOpacity
                  onPress={handleLogout}
                  className="flex-row items-center gap-3 px-4 py-3"
                >
                  <Feather name="log-out" size={18} color="#ef4444" />
                  <Text className="text-sm text-red-500">Logout</Text>
                </TouchableOpacity>
              </View>
            </Popover>

            <Pressable onPress={() => router.replace("/(tabs)")}>
              <Feather name="arrow-right" size={24} color="white" />
            </Pressable>
          </View>
          <View className="relative">
            {profileData?.user?.profile_image ? (
              <Image
                source={{ uri: profileData?.user.profile_image }}
                className="w-24 h-24 border-2 border-gray-700 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-24 h-24 bg-gray-800 border-2 border-gray-700 rounded-full">
                <Text className="text-3xl text-gray-400">
                  {profileData?.user?.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row justify-center w-full">
            <Text className="mt-3 text-2xl font-bold text-white">
              @{profileData?.user?.username}
            </Text>
          </View>
          <View className="flex-row justify-center w-full gap-2">
            <View className="flex-col items-center gap-1">
              <Text className="text-xl font-bold text-white">
                {profileData.user?.likes_count}
              </Text>
              <Text className="text-white">likes</Text>
            </View>
            <View className="flex-row items-center h-full">
              <Text className="text-white">|</Text>
            </View>
            <View className="flex-col items-center gap-1">
              <Text className="text-xl font-bold text-white">
                {profileData.user?.followers_count}
              </Text>
              <Text className="text-white">Followers</Text>
            </View>
            <View className="flex-row items-center h-full">
              <Text className="text-white">|</Text>
            </View>
            <View className="flex-col items-center gap-1">
              <Text className="text-xl font-bold text-white">
                {profileData.user?.following_count}
              </Text>
              <Text className="text-white">following</Text>
            </View>
          </View>
          <View className="flex-row justify-center w-full">
            <Text className="mt-1 text-sm text-gray-400">
              Joined{" "}
              {new Date(profileData?.user?.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View className="flex-row border-t border-gray-800">
          {(["videos", "liked", "saved"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-3 items-center border-b-2 ${
                tab === t ? "border-white" : "border-transparent"
              }`}
            >
              <Text
                className={`font-bold capitalize ${
                  tab === t ? "text-white" : "text-gray-500"
                }`}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {videosToDisplay.length === 0 && !isLoadingCurrentTab ? (
        <Text className="mt-8 text-center text-gray-400">No videos yet</Text>
      ) : (
        <FlatList
          data={videosToDisplay}
          keyExtractor={(v) => v.id.toString()}
          numColumns={3}
          scrollEnabled={true}
          onEndReached={loadMore}
          onEndReachedThreshold={0.01}
          renderItem={({ item }) => (
            <GridItem
              video={item}
              onPress={() => {
                router.push(`/singleVideo/${item.id}`);
              }}
            />
          )}
          ListFooterComponent={
            isLoadingCurrentTab ? (
              <ActivityIndicator
                color="#dc2626"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}

      <UserPreferedCategories
        openCategory={showCategoryModal}
        onCloseCategory={() => setShowCategoryModal(false)}
      />
    </View>
  );
}
