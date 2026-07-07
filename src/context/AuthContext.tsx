import {
  clearCurrentUser as clearStorage,
  getCurrentUser,
} from "@/helpers/api";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: string;
  username: string;
  profile_image?: string | null;
} | null;

type AuthContextType = {
  user: User;
  loadingUser: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loadingUser: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const refreshUser = async () => {
    const u = await getCurrentUser();
    setUser(u);
  };

  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoadingUser(false);
    })();
  }, []);

  const logout = async () => {
    await clearStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loadingUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
