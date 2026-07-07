import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/hooks/Requests";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Upload() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const { post } = usePost();
  const { user } = useAuth();

  const uploadFiles = async (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!user || assets.length === 0) return;

    setUploading(true);

    try {
      const BATCH_SIZE = 5;

      for (let i = 0; i < assets.length; i += BATCH_SIZE) {
        const batch = assets.slice(i, i + BATCH_SIZE);

        setProgress(
          assets.length > 1
            ? `Uploading ${i + 1}–${Math.min(i + BATCH_SIZE, assets.length)} of ${assets.length}...`
            : "Uploading...",
        );

        await Promise.all(
          batch.map(async (file) => {
            const formData = new FormData();
            formData.append("video", {
              uri: file.uri,
              name: file.fileName ?? `video_${Date.now()}.mp4`,
              type: file.mimeType ?? "video/mp4",
            } as any);
            formData.append("user_id", user.id);

            return post("/api/videos/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }),
        );
      }

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: `${assets.length} video${assets.length > 1 ? "s" : ""} uploaded! It will appear after review.`,
        visibilityTime: 4000,
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: err.message || "Something went wrong. Please try again.",
        visibilityTime: 4000,
      });
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const handleCamera = async () => {
    if (!user) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "warning",
        text1: "Camera permission required",
        text2: "Please allow camera access to record videos.",
        visibilityTime: 3000,
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "videos",
      videoMaxDuration: 300,
    });

    if (result.canceled || result.assets.length === 0) return;
    await uploadFiles(result.assets);
  };

  const handleGallery = async () => {
    if (!user) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "warning",
        text1: "Permission required",
        text2: "Please allow access to your media library to upload videos.",
        visibilityTime: 3000,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "videos",
      allowsMultipleSelection: true,
      videoMaxDuration: 300,
    });

    if (result.canceled || result.assets.length === 0) return;
    await uploadFiles(result.assets);
  };

  if (uploading) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
        <Text className="mt-4 text-center text-white">
          {progress ?? "Uploading..."}
        </Text>
        <Text className="mt-2 text-sm text-center text-gray-400">
          Please don't close the app
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center flex-1 gap-8 px-6 bg-black">
      <Text className="text-2xl font-bold text-white">Upload Video</Text>

      <TouchableOpacity
        onPress={handleCamera}
        className="items-center w-full gap-3 p-6 bg-gray-900 border border-gray-700 rounded-2xl"
      >
        <View className="items-center justify-center w-16 h-16 bg-red-600 rounded-full">
          <Feather name="video" size={28} color="#ffffff" />
        </View>
        <Text className="text-lg font-semibold text-white">Record Video</Text>
        <Text className="text-sm text-center text-gray-400">
          Open camera and record a new video
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGallery}
        className="items-center w-full gap-3 p-6 bg-gray-900 border border-gray-700 rounded-2xl"
      >
        <View className="items-center justify-center w-16 h-16 bg-gray-700 rounded-full">
          <MaterialIcons name="video-library" size={28} color="#ffffff" />
        </View>
        <Text className="text-lg font-semibold text-white">
          Choose from Library
        </Text>
        <Text className="text-sm text-center text-gray-400">
          Pick existing videos from your phone
        </Text>
      </TouchableOpacity>
    </View>
  );
}
