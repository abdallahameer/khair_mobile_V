import GridItem from "@/components/GridItems";
import VideoModal from "@/components/VideoModal";
import { apiClient, fetcher, getCurrentUser } from "@/helpers/api";
import { UserProfileType, VideoItem } from "@/helpers/videoDB";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_ITEM_SIZE = SCREEN_WIDTH / 3;

export default function OwnProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"videos" | "liked" | "saved">("videos");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => setCurrentUserId(u?.id ?? null));
  }, []);

  const {
    data: profileData,
    isLoading,
    mutate,
  } = useSWR<UserProfileType>(
    id ? `/api/users/${id}?viewer_id=${id}` : null,
    fetcher,
  );

  const { data: likedVideos } = useSWR<VideoItem[]>(
    id ? `/api/users/${id}/liked-videos` : null,
    fetcher,
  );

  const { data: savedVideos } = useSWR<VideoItem[]>(
    id ? `/api/users/${id}/saved-videos` : null,
    fetcher,
  );

  const videosToDisplay = useMemo(() => {
    if (tab === "videos") return profileData?.videos ?? [];
    if (tab === "liked") return likedVideos ?? [];
    if (tab === "saved") return savedVideos ?? [];
    return [];
  }, [tab, profileData?.videos, likedVideos, savedVideos]);

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

    setUploadingImage(true);
    try {
      const file = result.assets[0];
      const formData = new FormData();
      formData.append("image", {
        uri: file.uri,
        name: file.fileName ?? "profile.jpg",
        type: file.mimeType ?? "image/jpeg",
      } as any);
      formData.append("user_id", currentUserId);

      await apiClient.post("/api/users/upload-profile-image", formData, {
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
      setUploadingImage(false);
    }
  };

  if (isLoading || !profileData) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  const { user } = profileData;
  return (
    <View className="flex-1 bg-black">
      <ScrollView>
        <View className="items-center pt-10 pb-4">
          <Pressable onPress={() => router.replace("/(tabs)")}>
            <View className="flex-row items-center justify-end w-full px-4 py-3">
              <Feather name="arrow-right" size={24} color="white" />
            </View>
          </Pressable>
          <View className="relative">
            {user.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                className="w-24 h-24 border-2 border-gray-700 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-24 h-24 bg-gray-800 border-2 border-gray-700 rounded-full">
                <Text className="text-3xl text-gray-400">
                  {user.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text className="mt-3 text-2xl font-bold text-white">
            @{user.username}
          </Text>
          <Text className="mt-1 text-sm text-gray-400">
            Joined {new Date(user.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View className="flex-row border-t border-gray-800">
          <TouchableOpacity className="items-center flex-1 py-3 border-b-2">
            <Text className="font-bold text-white capitalize">Videos</Text>
          </TouchableOpacity>
        </View>

        {videosToDisplay.length === 0 ? (
          <Text className="mt-8 text-center text-gray-400">No videos yet</Text>
        ) : (
          <FlatList
            data={videosToDisplay}
            keyExtractor={(v) => v.id.toString()}
            numColumns={4}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <GridItem
                video={item}
                onPress={() => setSelectedVideoId(item.id.toString())}
              />
            )}
          />
        )}
      </ScrollView>

      {selectedVideoId && currentUserId && (
        <VideoModal
          videoId={selectedVideoId}
          currentUserId={currentUserId}
          onClose={() => setSelectedVideoId(null)}
        />
      )}
    </View>
  );
}
