import GridItem from "@/components/GridItems";
import VideoModal from "@/components/VideoModal";
import { fetcher } from "@/helpers/api";
import { UserProfileType } from "@/helpers/videoDB";
import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useSWR from "swr";

export default function OwnProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const { data: profileData, isLoading } = useSWR<UserProfileType>(
    id ? `/api/users/${id}?viewer_id=${id}` : null,
    fetcher,
  );

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
        <ScrollView>
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

          <View className="flex-row border-t border-gray-800">
            <TouchableOpacity className="items-center flex-1 py-3 border-b-2">
              <Text className="font-bold text-white capitalize">Videos</Text>
            </TouchableOpacity>
          </View>

          {profileData?.videos.length === 0 ? (
            <Text className="mt-8 text-center text-gray-400">
              No videos yet
            </Text>
          ) : (
            <FlatList
              data={profileData.videos}
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

        {selectedVideoId && (
          <VideoModal
            videoId={selectedVideoId}
            onClose={() => setSelectedVideoId(null)}
          />
        )}
      </View>
    );
  }
}
