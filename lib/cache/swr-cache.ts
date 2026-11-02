/**
 * High-performance client-side SWR (Stale-While-Revalidate) cache.
 * Provides instant page loads by storing data in-memory and persisting across page views in sessionStorage.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const STORAGE_PREFIX = "ryport_swr_";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh, but stale data can still be served

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage || window.localStorage;
  } catch {
    return null;
  }
}

export const swrCache = {
  get<T>(key: string): { data: T; isStale: boolean } | null {
    const now = Date.now();

    // 1. Check in-memory cache first (0ms latency)
    const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memEntry) {
      const isStale = now - memEntry.timestamp > memEntry.ttl;
      return { data: memEntry.data, isStale };
    }

    // 2. Check storage
    const storage = getStorage();
    if (!storage) return null;

    try {
      const raw = storage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return null;
      const parsed: CacheEntry<T> = JSON.parse(raw);
      // Sync to memory
      memoryCache.set(key, parsed as CacheEntry<unknown>);
      const isStale = now - parsed.timestamp > parsed.ttl;
      return { data: parsed.data, isStale };
    } catch {
      return null;
    }
  },

  set<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    memoryCache.set(key, entry as CacheEntry<unknown>);

    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
      } catch {
        // Storage quota exceeded or disabled, memory cache still functions
      }
    }
  },

  remove(key: string): void {
    memoryCache.delete(key);
    const storage = getStorage();
    if (storage) {
      try {
        storage.removeItem(`${STORAGE_PREFIX}${key}`);
      } catch {}
    }
  },

  clear(): void {
    memoryCache.clear();
    const storage = getStorage();
    if (storage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => storage.removeItem(k));
      } catch {}
    }
  },
};
