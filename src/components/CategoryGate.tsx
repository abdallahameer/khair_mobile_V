import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function CategoryGate() {
  const [redirectToCategories, setRedirectToCategories] = useState(false);
  const { user, loadingUser } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useSWR<{ categories: string[] }>(
    user ? `/api/users/${user.id}/categories` : null,
    fetcher,
  );

  useEffect(() => {
    if (loadingUser || !user || isLoading) return;

    if (data && data.categories.length === 0 && !redirectToCategories) {
      setRedirectToCategories(true);
      router.replace("/userCategories");
    }
  }, [loadingUser, user, isLoading, data, router]);

  return null;
}
