import { API_BASE_URL } from "@/lib/config";
import type { Profile } from "@/lib/api/types";

const STAFF_APP_URL = (
  process.env.NEXT_PUBLIC_STAFF_APP_URL ?? "https://staff.ryport.com.ng"
).replace(/\/+$/, "");

/** Staff React dashboard — replaces legacy Django `/ryport-ops/` for internal ops. */
export function getStaffDashboardUrl(path = "/login"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${STAFF_APP_URL}${normalized}`;
}

/** @deprecated Use getStaffDashboardUrl — kept for call sites */
export function getOpsDashboardUrl(): string {
  return getStaffDashboardUrl("/login");
}

export function isAdminUser(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (profile.is_staff === true) return true;
  return false;
}

export function redirectToOpsDashboard(): void {
  if (typeof window === "undefined") return;
  window.location.assign(getStaffDashboardUrl("/login"));
}
