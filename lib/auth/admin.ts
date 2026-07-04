import type { Profile } from "@/lib/api/types";
import { staffPath } from "@/lib/staff/routes";

export function getStaffDashboardUrl(path = "/login"): string {
  return staffPath(path);
}

/** @deprecated Use getStaffDashboardUrl */
export function getOpsDashboardUrl(): string {
  return getStaffDashboardUrl("/login");
}

export function isAdminUser(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (profile.is_staff === true) return true;
  return false;
}

export function redirectToStaffDashboard(path = "/login"): void {
  if (typeof window === "undefined") return;
  window.location.assign(staffPath(path));
}

/** @deprecated Use redirectToStaffDashboard */
export function redirectToOpsDashboard(): void {
  redirectToStaffDashboard("/login");
}
