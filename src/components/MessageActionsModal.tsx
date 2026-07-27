import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

export default function MessageActionsModal({
  open,
  setOpen,
  onEdit,
  onDelete,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const close = () => setOpen(false);

  return (
    <Modal transparent animationType="fade" visible={open}>
      <Pressable
        className="items-center justify-center flex-1 bg-black/60"
        onPress={close}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-[80%] max-w-sm"
        >
          <View className="overflow-hidden bg-gray-900 border border-gray-800 rounded-2xl">
            <TouchableOpacity
              onPress={() => {
                close();
                onEdit();
              }}
              className="flex-row items-center gap-3 px-5 py-4 border-b border-gray-800"
            >
              <Ionicons name="create-outline" size={20} color="#ffffff" />
              <Text className="text-base text-white">Edit message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                close();
                onDelete();
              }}
              className="flex-row items-center gap-3 px-5 py-4"
            >
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
              <Text className="text-base text-red-500">Delete message</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
