import { fetcher } from "@/helpers/api";
import { ConversationListItem } from "@/helpers/videoDB";
import { usePost } from "@/hooks/Requests";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library/legacy";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

type SheetView = "menu" | "sendTo" | "report";

export default function ShareModal({
  visible,
  onClose,
  videoId,
  userId,
  videoUrl,
  withTapbar = true,
}: {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  userId: string | null;
  videoUrl: string;
  withTapbar: boolean;
}) {
  const [view, setView] = useState<SheetView>("menu");
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<number>(0);
  const [sendingToId, setSendingToId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const { post } = usePost();
  const inset = useSafeAreaInsets();
  const tabBarHeight = !withTapbar ? 100 : 0;

  const { data: conversations, isLoading: isLoadingConversations } = useSWR<
    ConversationListItem[]
  >(userId ? `/api/conversations?user_id=${userId}` : null, fetcher);

  const close = () => {
    setView("menu");
    setReportReason("");
    onClose();
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(`https://khair.live/singleVideo/${videoId}`);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
      text2: "Video link has been copied.",
    });
    close();
  };

  const handleDownload = async () => {
    if (downloading) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "warning",
        text1: "Permission required",
        text2: "Please allow access to save videos to your library.",
        visibilityTime: 3000,
      });
      return;
    }

    setDownloading(true);

    const ext = videoUrl.split(".").pop()?.split("?")[0] || "mp4";
    const localUri = `${FileSystem.cacheDirectory}khair_${videoId}.${ext}`;

    try {
      const { uri } = await FileSystem.downloadAsync(videoUrl, localUri);
      await MediaLibrary.saveToLibraryAsync(uri);

      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: "Video saved to your gallery.",
        visibilityTime: 3000,
      });
      close();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Download failed",
        text2: err.message || "Please try again.",
        visibilityTime: 4000,
      });
    } finally {
      setDownloading(false);
      // Best-effort cleanup of the cached copy — not critical if it fails
      FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }
  };

  const handleSendToConversation = async (otherUserId: string) => {
    if (!userId || sendingToId) return;

    setSendingToId(otherUserId);

    try {
      await post("/api/messages", {
        sender_id: userId,
        other_user_id: otherUserId,
        text: `https://khair.live/singleVideo/${videoId}`,
      });

      Toast.show({
        type: "success",
        text1: "Sent!",
        visibilityTime: 2000,
      });
      close();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Couldn't send",
        text2: err.message || "Please try again.",
        visibilityTime: 3000,
      });
    } finally {
      setSendingToId(null);
    }
  };

  const handleSubmitReport = async () => {
    if (!userId) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to login first",
        visibilityTime: 3000,
      });
      return;
    }

    if (reportReason.trim().length === 0) {
      Toast.show({
        type: "warning",
        text1: "Reason required",
        text2: "Please tell us what's wrong with this video.",
        visibilityTime: 3000,
      });
      return;
    }

    if (submittingReport) return;
    setSubmittingReport(true);

    try {
      await post(`/api/videos/${videoId}/report`, {
        reporter_id: userId,
        reason: reportReason.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Report submitted",
        text2: "Thanks — we'll take a look.",
        visibilityTime: 3000,
      });
      close();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: err.message || "Please try again.",
        visibilityTime: 4000,
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setIsKeyboardVisible(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(0);
    });

    return () => {
      showSub.remove;
      hideSub.remove;
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      <Pressable
        style={{
          paddingBottom:
            isKeyboardVisible > 0
              ? isKeyboardVisible - Math.max(inset.bottom, 16) + tabBarHeight
              : Math.max(inset.bottom, 16),
        }}
        className="justify-end flex-1 bg-black/60"
        onPress={close}
      >
        <Pressable
          className="p-4 pb-8 bg-gray-900 rounded-t-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="self-center w-10 h-1 mb-4 bg-gray-700 rounded-full" />

          {view === "menu" && (
            <View className="flex-col gap-1">
              {conversations && conversations.length > 0 && (
                <View className="mb-3">
                  <Text className="px-2 mb-2 text-sm font-semibold text-gray-400">
                    Send to
                  </Text>
                  <FlatList
                    data={conversations}
                    keyExtractor={(c) => c.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8, gap: 16 }}
                    renderItem={({ item: conversation }) => (
                      <TouchableOpacity
                        onPress={() =>
                          handleSendToConversation(conversation.other_user_id)
                        }
                        disabled={sendingToId !== null}
                        className="items-center"
                        style={{
                          width: 64,
                          opacity:
                            sendingToId &&
                            sendingToId !== conversation.other_user_id
                              ? 0.4
                              : 1,
                        }}
                      >
                        <View>
                          {conversation.other_profile_image ? (
                            <Image
                              source={{ uri: conversation.other_profile_image }}
                              className="rounded-full w-14 h-14"
                            />
                          ) : (
                            <View className="items-center justify-center bg-gray-800 rounded-full w-14 h-14">
                              <Text className="text-lg font-bold text-white">
                                {conversation.other_username[0].toUpperCase()}
                              </Text>
                            </View>
                          )}
                          {sendingToId === conversation.other_user_id && (
                            <View className="absolute inset-0 items-center justify-center rounded-full bg-black/50">
                              <ActivityIndicator color="#ffffff" size="small" />
                            </View>
                          )}
                        </View>
                        <Text
                          className="w-full mt-1 text-xs text-center text-gray-300"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {conversation.other_username}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              {isLoadingConversations && (
                <View className="items-center py-2 mb-2">
                  <ActivityIndicator color="#dc2626" size="small" />
                </View>
              )}

              <TouchableOpacity
                onPress={handleDownload}
                disabled={downloading}
                className="flex-row items-center gap-4 p-3"
                style={{ opacity: downloading ? 0.6 : 1 }}
              >
                <View className="items-center justify-center w-10 h-10 bg-gray-800 rounded-full">
                  {downloading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Feather name="download" size={20} color="#ffffff" />
                  )}
                </View>
                <Text className="text-base text-white">
                  {downloading ? "Downloading..." : "Download video"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyLink}
                className="flex-row items-center gap-4 p-3"
              >
                <View className="items-center justify-center w-10 h-10 bg-gray-800 rounded-full">
                  <Ionicons name="link" size={20} color="#ffffff" />
                </View>
                <Text className="text-base text-white">Copy link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setView("report")}
                className="flex-row items-center gap-4 p-3"
              >
                <View className="items-center justify-center w-10 h-10 bg-gray-800 rounded-full">
                  <FontAwesome name="flag" size={18} color="#ef4444" />
                </View>
                <Text className="text-base text-red-500">Report</Text>
              </TouchableOpacity>
            </View>
          )}

          {view === "report" && (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View className="gap-3 p-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-white">
                    Report video
                  </Text>
                  <TouchableOpacity
                    onPress={() => setView("menu")}
                    disabled={submittingReport}
                  >
                    <Feather name="arrow-left" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <Text className="text-sm text-gray-400">
                  Tell us what's wrong with this video. Reports are reviewed
                  manually — the video stays visible until we look into it.
                </Text>

                <TextInput
                  value={reportReason}
                  onChangeText={setReportReason}
                  placeholder="Describe the issue..."
                  placeholderTextColor="#6b7280"
                  multiline
                  maxLength={1000}
                  editable={!submittingReport}
                  className="p-4 text-white bg-gray-800 border border-gray-700 rounded-xl"
                  style={{ minHeight: 90, textAlignVertical: "top" }}
                />

                <TouchableOpacity
                  onPress={handleSubmitReport}
                  disabled={submittingReport}
                  className="items-center p-4 bg-red-600 rounded-xl"
                  style={{ opacity: submittingReport ? 0.6 : 1 }}
                >
                  <Text className="text-base font-semibold text-white">
                    {submittingReport ? "Submitting..." : "Submit report"}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
