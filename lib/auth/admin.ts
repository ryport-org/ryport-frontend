import { API_BASE_URL } from "@/lib/config";
import type { Profile } from "@/lib/api/types";

/** Django ops dashboard on the API host — not part of this Next.js app. */
export function getOpsDashboardUrl(): string {
  return `${API_BASE_URL.replace(/\/+$/, "")}/ryport-ops/`;
}

export function isAdminUser(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (profile.is_staff === true) return true;
  return false;
}

export function redirectToOpsDashboard(): void {
  if (typeof window === "undefined") return;
  window.location.assign(getOpsDashboardUrl());
}
