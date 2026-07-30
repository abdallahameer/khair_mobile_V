import VideoModal from "@/components/VideoModal";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function LinkedVideo() {
  const { linkedVideo } = useLocalSearchParams<{ linkedVideo: string }>();
  const { user } = useAuth();
  const router = useRouter();
  return (
    <VideoModal
      videoId={linkedVideo}
      currentUserId={user?.id}
      onClose={() => {
        router.replace("/(tabs)");
      }}
    />
  );
}
