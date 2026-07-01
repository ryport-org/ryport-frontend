"use client";

import { useAuth } from "@/lib/auth/auth-context";

export function usePlan() {
  const { plan, canUse, getLimit } = useAuth();
  return { plan, canUse, getLimit };
}
