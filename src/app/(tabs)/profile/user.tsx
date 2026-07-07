import GridItem from "@/components/GridItems";
import VideoModal from "@/components/VideoModal";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { UserProfileType, VideoItem } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

export default function OwnProfileScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"videos" | "liked" | "saved">("videos");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { post } = usePost();
  const { user, logout } = useAuth();
  const currentUserId = user?.id ?? null;

  const {
    data: profileData,
    isLoading,
    mutate,
  } = useSWR<UserProfileType>(
    currentUserId
      ? `/api/users/${currentUserId}?viewer_id=${currentUserId}`
      : null,
    fetcher,
  );

  const { data: likedVideos } = useSWR<VideoItem[]>(
    currentUserId ? `/api/users/${currentUserId}/liked-videos` : null,
    fetcher,
  );

  const { data: savedVideos } = useSWR<VideoItem[]>(
    currentUserId ? `/api/users/${currentUserId}/saved-videos` : null,
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
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(tabs)/profile");
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
      <ScrollView>
        <View className="items-center pt-10 pb-4">
          <View className="relative">
            {profileData?.user?.profile_image ? (
              <Image
                source={{ uri: profileData.user.profile_image }}
                className="w-24 h-24 border-2 border-gray-700 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-24 h-24 bg-gray-800 border-2 border-gray-700 rounded-full">
                <Text className="text-3xl text-gray-400">
                  {profileData?.user?.username[0].toUpperCase()}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleImageUpload}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 items-center justify-center bg-red-600 rounded-full w-7 h-7"
              style={{ opacity: uploadingImage ? 0.5 : 1 }}
            >
              <Text className="text-lg leading-none text-white">+</Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-3 text-2xl font-bold text-white">
            @{profileData?.user?.username}
          </Text>
          <Text className="mt-1 text-sm text-gray-400">
            Joined{" "}
            {new Date(profileData?.user?.created_at).toLocaleDateString()}
          </Text>

          <TouchableOpacity onPress={handleLogout} className="mt-3">
            <Text className="text-sm text-gray-500">Logout</Text>
          </TouchableOpacity>
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

        {videosToDisplay.length === 0 ? (
          <Text className="mt-8 text-center text-gray-400">No videos yet</Text>
        ) : (
          <FlatList
            data={videosToDisplay}
            keyExtractor={(v) => v.id.toString()}
            numColumns={3}
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
