import { ApiError } from "@/lib/api/client";
import { StaffApiError } from "@/lib/staff/api/client";

/** Clear stored session only on explicit auth failure — not network blips. */
export function isCustomerAuthError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return (
    error.status === 401 ||
    error.status === 403 ||
    error.code === "invalid_token" ||
    error.code === "not_authenticated" ||
    error.code === "authentication_failed"
  );
}

export function isStaffAuthError(error: unknown): boolean {
  if (!(error instanceof StaffApiError)) return false;
  return (
    error.status === 401 ||
    error.code === "invalid_token" ||
    error.code === "not_authenticated" ||
    error.code === "authentication_failed"
  );
}
