import { Stack } from "expo-router";

export default function SingleVideoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[linkedVideo]" />
    </Stack>
  );
}
