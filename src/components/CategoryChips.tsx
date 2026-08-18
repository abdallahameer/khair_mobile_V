import { VIDEO_CATEGORIES } from "@/helpers/videoDB";
import { Text, TouchableOpacity, View } from "react-native";

export default function CategoryChips({
  selected,
  onToggle,
  disabled,
}: {
  selected: string[];
  onToggle: (category: string) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {VIDEO_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          onPress={() => onToggle(cat)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full border ${
            selected.includes(cat)
              ? "bg-red-600 border-red-600"
              : "bg-gray-900 border-gray-700"
          }`}
        >
          <Text
            className={`text-sm ${
              selected.includes(cat)
                ? "text-white font-semibold"
                : "text-gray-300"
            }`}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
