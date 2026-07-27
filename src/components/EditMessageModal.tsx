import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditMessageModal({
  open,
  setOpen,
  initialText,
  onSave,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  initialText: string;
  onSave: (newText: string) => void;
}) {
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setText(initialText);
  }, [open, initialText]);

  const close = () => setOpen(false);

  const handleSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(text.trim());
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={open}>
      <Pressable
        className="items-center justify-center flex-1 px-6 bg-black/60"
        onPress={close}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm"
        >
          <View className="p-5 bg-gray-900 border border-gray-800 rounded-2xl">
            <Text className="mb-3 text-lg font-semibold text-white">
              Edit message
            </Text>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message..."
              placeholderTextColor="#6b7280"
              multiline
              className="px-4 py-3 text-white bg-gray-800 rounded-xl"
              autoFocus
            />

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={close}
                className="items-center justify-center flex-1 py-3 bg-gray-800 rounded-full"
              >
                <Text className="font-medium text-gray-300">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={!text.trim() || saving}
                className="items-center justify-center flex-1 py-3 bg-red-600 rounded-full"
                style={{ opacity: !text.trim() || saving ? 0.5 : 1 }}
              >
                <Text className="font-semibold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
