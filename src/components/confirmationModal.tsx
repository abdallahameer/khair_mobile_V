import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmationModal({
  confirmationText,
  confirmButtonText,
  cancelButtonText,
  confirmFunc,
  cancelFunc,
  open,
  setOpen,
}: {
  confirmationText: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmFunc?: () => void;
  cancelFunc?: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const handleCancel = () => {
    cancelFunc?.();
    setOpen(false);
  };

  const handleConfirm = () => {
    confirmFunc?.();
    setOpen(false);
  };

  return (
    <Modal transparent animationType="fade" visible={open}>
      <TouchableOpacity
        className="items-center justify-center flex-1 bg-black/60"
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity activeOpacity={1} className="w-[85%] max-w-sm">
          <View className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={handleCancel} className="p-1">
                <Ionicons name="close" size={22} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View className="items-center self-center justify-center mb-4 rounded-full w-14 h-14 bg-red-600/10">
              <Ionicons name="alert-circle-outline" size={30} color="#dc2626" />
            </View>

            <Text className="text-lg font-semibold text-center text-white">
              {confirmationText}
            </Text>

            <View className="gap-3 mt-6">
              <TouchableOpacity
                onPress={handleConfirm}
                className="items-center justify-center py-3 bg-red-600 rounded-full"
              >
                <Text className="font-semibold text-white">
                  {confirmButtonText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancel}
                className="items-center justify-center py-3 bg-gray-800 rounded-full"
              >
                <Text className="font-medium text-gray-300">
                  {cancelButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
