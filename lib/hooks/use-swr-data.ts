"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { swrCache } from "@/lib/cache/swr-cache";

interface UseSwrOptions<T> {
  enabled?: boolean;
  ttlMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
}

interface UseSwrResult<T> {
  data: T | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  isCached: boolean;
  reload: () => Promise<void>;
  mutate: (newData: T | ((prev: T | null) => T), revalidate?: boolean) => void;
}

export function useSwrData<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseSwrOptions<T> = {},
): UseSwrResult<T> {
  const { enabled = true, ttlMs, onSuccess, onError } = options;

  // Initialize from cache immediately to achieve 0ms initial render
  const [data, setData] = useState<T | null>(() => {
    if (!key || typeof window === "undefined") return null;
    const cached = swrCache.get<T>(key);
    return cached ? cached.data : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!key || !enabled) return false;
    if (typeof window === "undefined") return true;
    const cached = swrCache.get<T>(key);
    return !cached;
  });

  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState<boolean>(() => {
    if (!key || typeof window === "undefined") return false;
    return Boolean(swrCache.get<T>(key));
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const performFetch = useCallback(
    async (isManualReload = false) => {
      if (!key || !enabled) return;

      const cached = swrCache.get<T>(key);
      if (!cached && !isManualReload) {
        setIsLoading(true);
      }
      setIsValidating(true);
      setError(null);

      try {
        const fresh = await fetcherRef.current();
        swrCache.set(key, fresh, ttlMs);
        setData(fresh);
        setIsCached(false);
        onSuccessRef.current?.(fresh);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        onErrorRef.current?.(err);
      } finally {
        setIsLoading(false);
        setIsValidating(false);
      }
    },
    [key, enabled, ttlMs],
  );

  useEffect(() => {
    if (!key || !enabled) return;

    // Check if we need to load or revalidate
    const cached = swrCache.get<T>(key);
    if (cached) {
      setData(cached.data);
      setIsCached(true);
      setIsLoading(false);
      // Revalidate in background if stale
      if (cached.isStale) {
        void performFetch();
      }
    } else {
      void performFetch();
    }
  }, [key, enabled, performFetch]);

  const mutate = useCallback(
    (newData: T | ((prev: T | null) => T), revalidate = false) => {
      setData((prev) => {
        const resolved =
          typeof newData === "function"
            ? (newData as (p: T | null) => T)(prev)
            : newData;
        if (key) {
          swrCache.set(key, resolved, ttlMs);
        }
        return resolved;
      });
      if (revalidate) {
        void performFetch(true);
      }
    },
    [key, ttlMs, performFetch],
  );

  const reload = useCallback(async () => {
    await performFetch(true);
  }, [performFetch]);

  return {
    data,
    isLoading,
    isValidating,
    error,
    isCached,
    reload,
    mutate,
  };
}
