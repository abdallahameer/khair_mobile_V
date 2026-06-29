import {
  Feather,
  FontAwesome,
  Ionicons as HomeIcon,
  MaterialIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

// Colors taken straight from our theme tokens (kept inline here since
// expo-router's tabBarActiveTintColor etc. expect plain strings, not
// className — the tab bar chrome itself is configured via props, not Tailwind).
const COLORS = {
  background: "#000000",
  border: "#1f2937",
  active: "red",
  inactive: "#6b7280",
  primary: "#dc2626",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 100,
        },
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon name="person-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="telegram" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",

          tabBarIcon: () => (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: COLORS.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="plus" size={22} color="#ffffff" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon name="home" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
