import Toast from "react-native-toast-message";

const toastify = ({
  message = "",
  content = "",
  status = "info",
}: {
  message?: string;
  content?: string;
  status?: "success" | "error" | "warning" | "info";
}) => {
  Toast.show({
    type: status,
    text1: message,
    text2: content || undefined,
    visibilityTime: 3000,
  });
};

export default toastify;
