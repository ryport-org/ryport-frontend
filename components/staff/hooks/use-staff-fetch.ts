"use client";

import { useCallback, useEffect, useState } from "react";
import { StaffApiError } from "@/lib/staff/api/client";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";

export function useStaffFetch<T>(fetcher: (token: string) => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = getStaffAccessToken();
    if (!token) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetcher(token);
      setData(result);
    } catch (err) {
      if (err instanceof StaffApiError) {
        setError(err.message);
      } else {
        setError("Could not load data. Please try again.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
