import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "https://my-worker.mohammad-3db.workers.dev";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000 * 60 * 10,
});

apiClient.interceptors.request.use((config) => {
  const isFormData = config.data instanceof FormData;
  if (!isFormData) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);

export const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

export const getCurrentUser = async (): Promise<{
  id: string;
  username: string;
  profile_image?: string | null;
} | null> => {
  const stored = await AsyncStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = async (user: {
  id: string;
  username: string;
}) => {
  await AsyncStorage.setItem("user", JSON.stringify(user));
};

export const clearCurrentUser = async () => {
  await AsyncStorage.removeItem("user");
};
