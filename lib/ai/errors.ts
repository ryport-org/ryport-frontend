import { ApiError } from "@/lib/api/client";

export function isQuotaExceeded(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (
      error.code === "quota_exceeded" ||
      error.code === "limit_reached" ||
      error.code === "rate_limited" ||
      error.code === "daily_limit_exceeded" ||
      error.status === 403 ||
      error.status === 429
    ) {
      return true;
    }
  }
  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes("invalid api") ||
      lower.includes("supabase") ||
      lower.includes("access token") ||
      lower.includes("token expired") ||
      lower.includes("quota") ||
      lower.includes("limit")
    ) {
      return true;
    }
  }
  return false;
}

export function isFeatureNotAvailable(error: unknown): boolean {
  return error instanceof ApiError && error.code === "feature_not_available";
}

export function getAiErrorMessage(error: unknown): string {
  if (isQuotaExceeded(error)) {
    return "You have reached your daily limit of 10 AI chat questions. Upgrade to Pro for unlimited AI chat.";
  }
  if (error instanceof ApiError) {
    if (error.code === "feature_not_available") {
      return error.message || "This feature is not on your current plan. Upgrade to unlock full AI capabilities.";
    }
    if (error.code === "not_authenticated") {
      return "Your session expired. Please sign in again.";
    }
    return error.message;
  }
  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes("invalid api") ||
      lower.includes("supabase") ||
      lower.includes("access token") ||
      lower.includes("token expired")
    ) {
      return "You have reached your daily limit of 10 AI chat questions. Upgrade to Pro for unlimited AI chat.";
    }
    return error.message;
  }
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
  if (error instanceof ApiError && error.upgradeUrl?.startsWith("/")) {
    return `/app${error.upgradeUrl}`;
  }
  return "/app/upgrade";
}
