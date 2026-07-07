import { useAuth } from "@/context/AuthContext";
import { setCurrentUser } from "@/helpers/api";
import { usePost } from "@/hooks/Requests";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FormValues {
  userName: string;
  password: string;
}

export default function AuthForm({ mode }: { mode: "registration" | "login" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { post } = usePost();
  const { refreshUser } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { userName: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/users/login" : "/api/users/register";

      const response = await post(endpoint, {
        username: data.userName,
        password: data.password,
      });

      await setCurrentUser({
        id: response.id,
        username: response.username,
      });
      await refreshUser();
      router.replace("/(tabs)");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-bold text-center mb-8">
        {mode === "login" ? "Login" : "Register"}
      </Text>

      {serverError && (
        <View className="bg-red-600 rounded-lg p-3 mb-4">
          <Text className="text-white text-sm">{serverError}</Text>
        </View>
      )}

      <View className="mb-5">
        <Text className="text-gray-200 text-sm font-medium mb-2">Username</Text>
        <Controller
          control={control}
          name="userName"
          rules={{
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Enter your username"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          )}
        />
        {errors.userName && (
          <Text className="text-red-400 text-sm mt-1">
            {errors.userName.message}
          </Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-gray-200 text-sm font-medium mb-2">Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Enter your password"
              placeholderTextColor="#6b7280"
              secureTextEntry
              autoCapitalize="none"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          )}
        />
        {errors.password && (
          <Text className="text-red-400 text-sm mt-1">
            {errors.password.message}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className="bg-blue-600 rounded-lg py-3 items-center"
        style={{ opacity: loading ? 0.5 : 1 }}
      >
        {loading ? (
          <ActivityIndicator color="red" />
        ) : (
          <Text className="text-white font-medium">
            {mode === "login" ? "Login" : "Register"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.replace(mode === "login" ? "/register" : "/login")
        }
        className="mt-4"
      >
        <Text className="text-red-500 text-center text-sm">
          {mode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
