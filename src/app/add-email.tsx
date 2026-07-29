import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/hooks/Requests";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddEmail() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { post } = usePost();
  const handleSubmit = async () => {
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      await post("/api/users/add-email", {
        user_id: user.id,
        email: email.trim(),
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="justify-center flex-1 px-6 bg-black"
    >
      <Text className="mb-2 text-3xl font-bold text-center text-white">
        Add your email
      </Text>
      <Text className="mb-8 text-sm text-center text-gray-400">
        We'll use this to help you recover your account if you ever forget your
        password.
      </Text>

      {error && (
        <View className="p-3 mb-4 bg-red-600 rounded-lg">
          <Text className="text-sm text-white">{error}</Text>
        </View>
      )}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
        keyboardType="email-address"
        className="px-4 py-3 mb-6 text-white bg-gray-800 border border-gray-700 rounded-lg"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !email.trim()}
        className="items-center py-3 bg-red-600 rounded-lg"
        style={{ opacity: loading || !email.trim() ? 0.5 : 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="font-medium text-white">Continue</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
