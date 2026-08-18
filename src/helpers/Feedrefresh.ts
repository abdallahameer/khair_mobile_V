import useSWR, { mutate } from "swr";

const FEED_REFRESH_KEY = "feed-refresh-token";

export function useFeedRefreshToken() {
  const { data } = useSWR<number>(FEED_REFRESH_KEY, null, {
    fallbackData: 0,
  });
  console.log(data);
  return data ?? 0;
}

export function triggerFeedRefresh() {
  mutate(FEED_REFRESH_KEY, (prev: number = 0) => prev + 1, {
    revalidate: false,
  });
}
