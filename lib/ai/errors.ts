import { ApiError } from "@/lib/api/client";

export function isQuotaExceeded(error: unknown): boolean {
  return error instanceof ApiError && error.code === "quota_exceeded";
}

export function isFeatureNotAvailable(error: unknown): boolean {
  return error instanceof ApiError && error.code === "feature_not_available";
}

export function getAiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "quota_exceeded") {
      return error.message || "You have reached your daily AI message limit.";
    }
    if (error.code === "feature_not_available") {
      return error.message || "This feature is not on your current plan.";
    }
    if (error.code === "not_authenticated") {
      return "Your session expired. Please sign in again.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Server returns HTTP 200 with a friendly error string when AI is misconfigured. */
export function looksLikeAiMisconfiguration(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("ai is not configured") ||
    lower.includes("contact support") ||
    lower.includes("not configured on the server")
  );
}

export function getAiUpgradeHref(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.code !== "quota_exceeded" && error.code !== "feature_not_available") {
    return null;
  }
  if (error.upgradeUrl?.startsWith("/")) {
    return `/app${error.upgradeUrl}`;
  }
  return "/app/upgrade";
}
