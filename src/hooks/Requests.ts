import { useState } from "react";
import { apiClient } from "../helpers/api";

interface UseRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onProgress?: (progress: number) => void;
  headers?: Record<string, string>;
}

export function usePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (url: string, data?: any, options?: UseRequestOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(url, data, {
        headers: options?.headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && options?.onProgress) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );
            options.onProgress(progress);
          }
        },
      });

      setLoading(false);
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Request failed";
      setError(message);
      setLoading(false);
      options?.onError?.(err);
      throw err;
    }
  };

  return { post, loading, error };
}

export function usePut() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const put = async (url: string, data?: any, options?: UseRequestOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(url, data, {
        headers: options?.headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && options?.onProgress) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );
            options.onProgress(progress);
          }
        },
      });

      setLoading(false);
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Request failed";
      setError(message);
      setLoading(false);
      options?.onError?.(err);
      throw err;
    }
  };

  return { put, loading, error };
}

export function usePatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = async (
    url: string,
    data?: any,
    options?: UseRequestOptions,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch(url, data, {
        headers: options?.headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && options?.onProgress) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );
            options.onProgress(progress);
          }
        },
      });

      setLoading(false);
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Request failed";
      setError(message);
      setLoading(false);
      options?.onError?.(err);
      throw err;
    }
  };

  return { patch, loading, error };
}

export function useDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRequest = async (
    url: string,
    data?: any,
    options?: UseRequestOptions,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(url, {
        data,
        headers: options?.headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && options?.onProgress) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );
            options.onProgress(progress);
          }
        },
      });

      setLoading(false);
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Request failed";
      setError(message);
      setLoading(false);
      options?.onError?.(err);
      throw err;
    }
  };

  return { delete: deleteRequest, loading, error };
}
