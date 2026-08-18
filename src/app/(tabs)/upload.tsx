import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/hooks/Requests";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Upload() {
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { post } = usePost();
  const { user } = useAuth();

  const resetForm = () => {
    setSelectedAsset(null);
    setDescription("");
    setCategory(null);
  };

  const handleUpload = async () => {
    if (!user || !selectedAsset) return;

    if (!category) {
      Toast.show({
        type: "warning",
        text1: "Category required",
        text2: "Please choose a category for your video.",
        visibilityTime: 3000,
      });
      return;
    }

    if (uploading) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("video", {
        uri: selectedAsset.uri,
        name: selectedAsset.fileName ?? `video_${Date.now()}.mp4`,
        type: selectedAsset.mimeType ?? "video/mp4",
      } as any);
      formData.append("user_id", user.id);
      formData.append("description", description.trim());
      formData.append("category", category);

      await post("/api/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Toast.show({
        type: "success",
        text1: "Posted!",
        text2: "Your video is live.",
        visibilityTime: 3000,
      });
      resetForm();
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
    setSelectedAsset(result.assets[0]);
  };

  const handleGallery = async () => {
    if (!user) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "videos",
      allowsMultipleSelection: false,
      videoMaxDuration: 300,
    });

    if (result.canceled || result.assets.length === 0) return;
    setSelectedAsset(result.assets[0]);
  };

  if (uploading) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-black">
        <ActivityIndicator color="#dc2626" size="large" />
        <Text className="mt-4 text-center text-white">Uploading...</Text>
        <Text className="mt-2 text-sm text-center text-gray-400">
          Please don't close the app
        </Text>
      </View>
    );
  }

  if (selectedAsset) {
    return (
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ padding: 24, gap: 24 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Video Details</Text>
          <TouchableOpacity onPress={resetForm} disabled={uploading}>
            <Feather name="x" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-gray-300">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Say something about your video..."
            placeholderTextColor="#6b7280"
            multiline
            maxLength={2000}
            className="p-4 text-white bg-gray-900 border border-gray-700 rounded-xl"
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-gray-300">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {VIDEO_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${
                  category === cat
                    ? "bg-red-600 border-red-600"
                    : "bg-gray-900 border-gray-700"
                }`}
              >
                <Text
                  className={`text-sm ${
                    category === cat
                      ? "text-white font-semibold"
                      : "text-gray-300"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading}
          className="items-center p-4 bg-red-600 rounded-xl"
        >
          <Text className="text-lg font-semibold text-white">Post Video</Text>
        </TouchableOpacity>
      </ScrollView>
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
          Pick one video from your phone
        </Text>
      </TouchableOpacity>
    </View>
  );
}
