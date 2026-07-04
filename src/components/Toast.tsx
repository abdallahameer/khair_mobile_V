import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const TYPE_CONFIG = {
  success: { icon: "checkmark-circle" as const, color: "#22c55e" },
  error: { icon: "close-circle" as const, color: "#dc2626" },
  warning: { icon: "warning" as const, color: "#f59e0b" },
  info: { icon: "information-circle" as const, color: "#3b82f6" },
};

function ToastBase({
  text1,
  text2,
  type,
  onClose,
}: {
  text1?: string;
  text2?: string;
  type: keyof typeof TYPE_CONFIG;
  onClose: () => void;
}) {
  const { icon, color } = TYPE_CONFIG[type];

  return (
    <View
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
      className="flex-row items-center gap-3 px-4 py-3 mx-4 bg-gray-900 shadow-lg rounded-xl"
    >
      <Ionicons name={icon} size={22} color={color} />

      <View className="flex-1">
        {text1 ? (
          <Text className="text-sm font-bold text-white">{text1}</Text>
        ) : null}
        {text2 ? (
          <Text className="text-xs text-gray-400 mt-0.5">{text2}</Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={onClose} className="p-1">
        <Ionicons name="close" size={18} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}

export const toastify = {
  success: ({ text1, text2, hide }: any) => (
    <ToastBase text1={text1} text2={text2} type="success" onClose={hide} />
  ),
  error: ({ text1, text2, hide }: any) => (
    <ToastBase text1={text1} text2={text2} type="error" onClose={hide} />
  ),
  warning: ({ text1, text2, hide }: any) => (
    <ToastBase text1={text1} text2={text2} type="warning" onClose={hide} />
  ),
  info: ({ text1, text2, hide }: any) => (
    <ToastBase text1={text1} text2={text2} type="info" onClose={hide} />
  ),
};
