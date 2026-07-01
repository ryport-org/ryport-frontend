import type { Session } from "@supabase/supabase-js";

const ACCESS_KEY = "ryport_access_token";
const REFRESH_KEY = "ryport_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function syncSessionTokens(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, session.access_token);
  localStorage.setItem(REFRESH_KEY, session.refresh_token);
  document.cookie = `ryport_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/** @deprecated Use syncSessionTokens — kept for compatibility */
export function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  document.cookie = `ryport_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = "ryport_auth=; path=/; max-age=0";
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
