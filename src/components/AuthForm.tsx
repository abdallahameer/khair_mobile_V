import { useAuth } from "@/context/AuthContext";
import { setCurrentUser } from "@/helpers/api";
import { usePost } from "@/hooks/Requests";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FormValues {
  userName: string;
  email: string;
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
    defaultValues: { userName: "", email: "", password: "" },
  });

  const isRegister = mode === "registration";

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/users/register" : "/api/users/login";

      const payload = isRegister
        ? {
            username: data.userName.trim(),
            email: data.email.trim(),
            password: data.password.trim(),
          }
        : {
            username: data.userName.trim(),
            password: data.password.trim(),
          };

      const response = await post(endpoint, payload);

      await setCurrentUser({
        id: response.id,
        username: response.username,
      });
      await refreshUser();

      if (!isRegister && response.needs_email) {
        router.replace("/add-email");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Something went wrong";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="justify-center flex-1 px-6 bg-black"
    >
      <Text className="mb-8 text-3xl font-bold text-center text-white">
        {isRegister ? "Create Account" : "Welcome Back"}
      </Text>

      {serverError && (
        <View className="p-3 mb-4 bg-red-600 rounded-lg">
          <Text className="text-sm text-white">{serverError}</Text>
        </View>
      )}

      <View className="mb-5">
        <Text className="mb-2 text-sm font-medium text-gray-200">Username</Text>
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
              className="px-4 py-3 text-white bg-gray-800 border border-gray-700 rounded-lg"
            />
          )}
        />
        {errors.userName && (
          <Text className="mt-1 text-sm text-red-400">
            {errors.userName.message}
          </Text>
        )}
      </View>

      {isRegister && (
        <View className="mb-5">
          <Text className="mb-2 text-sm font-medium text-gray-200">Email</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="you@example.com"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                keyboardType="email-address"
                className="px-4 py-3 text-white bg-gray-800 border border-gray-700 rounded-lg"
              />
            )}
          />
          {errors.email && (
            <Text className="mt-1 text-sm text-red-400">
              {errors.email.message}
            </Text>
          )}
        </View>
      )}

      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-200">Password</Text>
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
              className="px-4 py-3 text-white bg-gray-800 border border-gray-700 rounded-lg"
            />
          )}
        />
        {errors.password && (
          <Text className="mt-1 text-sm text-red-400">
            {errors.password.message}
          </Text>
        )}
      </View>

      {!isRegister && (
        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          className="self-end mb-6"
        >
          <Text className="text-sm text-gray-400">Forgot password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className="items-center py-3 bg-red-600 rounded-lg"
        style={{ opacity: loading ? 0.5 : 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="font-medium text-white">
            {isRegister ? "Register" : "Login"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace(isRegister ? "/login" : "/register")}
        className="mt-4"
      >
        <Text className="text-sm text-center text-red-500">
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
