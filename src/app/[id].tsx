import GridItem from "@/components/GridItems";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { UserProfileType, VideosPage } from "@/helpers/videoDB";
import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function OtherProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { user, loadingUser } = useAuth();

  const { data: profileData, isLoading } = useSWR<UserProfileType>(
    id ? `/api/users/${id}` : null,
    fetcher,
  );

  const getVideosKey = (
    pageIndex: number,
    previousPageData: VideosPage | null,
  ) => {
    if (loadingUser) return null;
    if (!id) return null;
    if (previousPageData && !previousPageData.nextCursor) return null;

    const cursorParams =
      pageIndex === 0
        ? ""
        : `&cursor=${encodeURIComponent(previousPageData!.nextCursor!)}`;

    const viewerParam = user ? `&viewer_id=${user.id}` : "";

    return `/api/users/${id}/videos?limit=10${viewerParam}${cursorParams}`;
  };

  const {
    data: videosData,
    size: videosSize,
    setSize: setVideosSize,
    isLoading: isLoadingVideos,
  } = useSWRInfinite<VideosPage>(getVideosKey, fetcher);

  const videos = videosData ? videosData.flatMap((page) => page.videos) : [];
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

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  if (profileData) {
    return (
      <View className="flex-1 bg-black">
        <View>
          <View className="items-center pt-10 pb-4">
            <Pressable onPress={() => router.replace("/(tabs)")}>
              <View className="flex-row items-center justify-end w-full px-4 py-3">
                <Feather name="arrow-right" size={24} color="white" />
              </View>
            </Pressable>
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

            <Text className="mt-3 text-2xl font-bold text-white">
              @{profileData?.user?.username}
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              Joined{" "}
              {new Date(profileData?.user?.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex flex-row justify-center w-full mb-2">
            <TouchableOpacity
              onPress={() => router.replace(`./(tabs)/messages/chat/${id}`)}
              className="w-[50%]"
            >
              <View className="flex items-center justify-center w-full p-3 bg-red-500 rounded-lg text-whi te ">
                <Text>Messaging</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row border-t border-gray-800">
            <TouchableOpacity className="items-center flex-1 py-3 border-b-2">
              <Text className="font-bold text-white capitalize">Videos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {videos.length === 0 && !isLoadingMoreVideos ? (
          <Text className="mt-8 text-center text-gray-400">No videos yet</Text>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(v) => v.id.toString()}
            numColumns={4}
            scrollEnabled={false}
            onEndReached={loadMoreVideos}
            onEndReachedThreshold={0.01}
            renderItem={({ item }) => (
              <GridItem
                video={item}
                onPress={() => router.push(`/singleVideo/${item.id}`)}
              />
            )}
            ListFooterComponent={
              isLoadingMoreVideos ? (
                <ActivityIndicator
                  color="#dc2626"
                  style={{ marginVertical: 16 }}
                />
              ) : null
            }
          />
        )}

        {/* {selectedVideoId && (
          <VideoModal
            videoId={selectedVideoId}
            onClose={() => setSelectedVideoId(null)}
          />
        )} */}
      </View>
    );
  }
}
