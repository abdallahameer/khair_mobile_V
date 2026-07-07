import { toastConfig } from "@/components/ToastNotification";
import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import "../../global.css";
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ presentation: "modal" }} />
        <Stack.Screen name="register" options={{ presentation: "modal" }} />
        <Stack.Screen name="[id]" options={{ presentation: "modal" }} />
      </Stack>
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
