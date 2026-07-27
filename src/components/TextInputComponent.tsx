import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TextInputComponent({
  onSubmit,
  text,
  setText,
  buttonText,
  placeHolder,
  loading,
}: {
  onSubmit: () => void;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  buttonText: string;
  placeHolder: string;
  loading: boolean;
}) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<number>(0);
  const insets = useSafeAreaInsets();

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
    <View
      className="flex-row gap-2 px-4 pt-4 bg-black border-t border-gray-700"
      style={{
        paddingBottom:
          isKeyboardVisible > 0
            ? isKeyboardVisible - Math.max(insets.bottom, 16)
            : Math.max(insets.bottom, 16),
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeHolder}
        placeholderTextColor="#6b7280"
        className="flex-1 px-4 py-2 text-white bg-gray-800 rounded-full"
        onSubmitEditing={onSubmit}
      />

      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading || !text.trim()}
        className="items-center justify-center px-4 py-2 bg-red-600 rounded-full"
        style={{ opacity: loading || !text.trim() ? 0.5 : 1 }}
      >
        <Text className="text-white">{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}
