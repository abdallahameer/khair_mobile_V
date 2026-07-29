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

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { post } = usePost();
  const handleSubmit = async () => {
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await post("/api/auth/forgot-password", {
        email: email.trim(),
      });
      setSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-black">
        <View className="items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-600/10">
          <Text className="text-3xl">✉️</Text>
        </View>
        <Text className="mb-2 text-2xl font-bold text-center text-white">
          Check your email
        </Text>
        <Text className="mb-8 text-center text-gray-400">
          If an account exists with that email, we've sent a link to reset your
          password. It'll expire in 30 minutes.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          className="items-center w-full py-3 bg-red-600 rounded-lg"
        >
          <Text className="font-medium text-white">Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="justify-center flex-1 px-6 bg-black"
    >
      <Text className="mb-2 text-3xl font-bold text-center text-white">
        Forgot Password
      </Text>
      <Text className="mb-8 text-sm text-center text-gray-400">
        Enter the email associated with your account and we'll send you a link
        to reset your password.
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
          <Text className="font-medium text-white">Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} className="mt-4">
        <Text className="text-sm text-center text-red-500">Back to Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
