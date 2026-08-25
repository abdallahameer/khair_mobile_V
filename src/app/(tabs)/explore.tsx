import ExploreCard from "@/components/ExploreCard";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/helpers/api";
import {
  FeedPage,
  SearchPage,
  SearchUser,
  Video,
  VIDEO_CATEGORIES,
} from "@/helpers/videoDB";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useSWRInfinite from "swr/infinite";

const CATEGORY_PILLS = ["All", ...VIDEO_CATEGORIES];

export default function Explore() {
  const { user, loadingUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const isSearching = searchQuery.length > 0;

  const getExploreKey = (
    pageIndex: number,
    previousPageData: FeedPage | null,
  ) => {
    if (loadingUser) return null;
    if (isSearching) return null;
    if (previousPageData && !previousPageData.hasMore) return null;

    const offset = pageIndex === 0 ? 0 : previousPageData!.nextOffset;
    const userParam = user ? `&user_id=${user.id}` : "";
    const categoryParam =
      selectedCategory !== "All"
        ? `&category=${encodeURIComponent(selectedCategory)}`
        : "";

    return `/api/videos/explore?limit=10&offset=${offset}${userParam}${categoryParam}`;
  };

  const {
    data: exploreData,
    size: exploreSize,
    setSize: setExploreSize,
    isLoading: isLoadingExplore,
  } = useSWRInfinite<FeedPage>(getExploreKey, fetcher);

  const getSearchKey = (
    pageIndex: number,
    previousPageData: SearchPage | null,
  ) => {
    if (loadingUser) return null;
    if (!isSearching) return null;
    if (previousPageData && !previousPageData.hasMoreVideos) return null;

    const videoOffset = pageIndex === 0 ? 0 : previousPageData!.nextVideoOffset;
    const userParam = user ? `&user_id=${user.id}` : "";

    return `/api/search?q=${encodeURIComponent(searchQuery)}&video_limit=10&video_offset=${videoOffset}&user_limit=5&user_offset=0${userParam}`;
  };

  const {
    data: searchData,
    size: searchSize,
    setSize: setSearchSize,
    isLoading: isLoadingSearch,
  } = useSWRInfinite<SearchPage>(getSearchKey, fetcher);

  useEffect(() => {
    setSearchSize(1);
  }, [searchQuery]);

  useEffect(() => {
    setExploreSize(1);
  }, [selectedCategory]);

  const exploreVideos: Video[] = useMemo(
    () => (exploreData ? exploreData.flatMap((page) => page.videos) : []),
    [exploreData],
  );

  const searchVideos: Video[] = useMemo(
    () => (searchData ? searchData.flatMap((page) => page.videos) : []),
    [searchData],
  );

  const searchUsers: SearchUser[] = searchData?.[0]?.users ?? [];

  const videosToDisplay = isSearching ? searchVideos : exploreVideos;
  const isLoading = isSearching ? isLoadingSearch : isLoadingExplore;

  const handleLoadMore = () => {
    if (isSearching) {
      setSearchSize(searchSize + 1);
    } else {
      setExploreSize(exploreSize + 1);
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const noResults =
    isSearching &&
    !isLoading &&
    searchVideos.length === 0 &&
    searchUsers.length === 0;

  return (
    <View className="flex-1 bg-black pt-14">
      <View className="flex-row items-center px-3 py-2 mx-3 mb-3 rounded-full bg-neutral-900">
        <Feather
          name="search"
          size={18}
          color="#9ca3af"
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search"
          placeholderTextColor="#9ca3af"
          className="flex-1 text-white"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => setSearchInput("")}>
            <Feather name="x" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category pill bar — hidden while searching, matches TikTok-style behavior */}
      {!isSearching && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-none px-2 mb-3"
          contentContainerStyle={{ alignItems: "center", gap: 8 }}
        >
          {CATEGORY_PILLS.map((cat) => {
            const isActive = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => handleSelectCategory(cat)}
                className={`px-4 py-2 rounded-full ${
                  isActive ? "bg-white" : "bg-neutral-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isActive ? "text-black font-semibold" : "text-neutral-300"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {isSearching && searchUsers.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-none px-3 mb-3"
          contentContainerStyle={{ gap: 14 }}
        >
          {searchUsers.map((u) => (
            <TouchableOpacity
              key={u.id}
              onPress={() => router.push(`/profile/${u.id}` as any)}
              className="items-center w-16"
            >
              {u.profile_image ? (
                <Image
                  source={{ uri: u.profile_image }}
                  className="rounded-full w-14 h-14 bg-neutral-800"
                />
              ) : (
                <View className="items-center justify-center rounded-full w-14 h-14 bg-neutral-800">
                  <Text className="text-lg text-gray-400">
                    {u.username[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              <Text className="mt-1 text-xs text-white" numberOfLines={1}>
                @{u.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {noResults ? (
        <Text className="mt-8 text-center text-gray-400">No results found</Text>
      ) : (
        <FlatList
          data={videosToDisplay}
          numColumns={2}
          columnWrapperStyle={{
            gap: 10,
            paddingHorizontal: 10,
          }}
          scrollEnabled={true}
          keyExtractor={(v) => v.id.toString()}
          renderItem={({ item }) => (
            <ExploreCard
              onPress={() => router.push(`/singleVideo/${item.id}`)}
              video={item}
            />
          )}
          onEndReachedThreshold={0.01}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator
                color="#dc2626"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
