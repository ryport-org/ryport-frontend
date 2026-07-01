const ACCESS_KEY = "ryport_access_token";
const REFRESH_KEY = "ryport_refresh_token";
const AUTH_SOURCE_KEY = "ryport_auth_source";

export type AuthSource = "ryport" | "supabase";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getAuthSource(): AuthSource | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(AUTH_SOURCE_KEY);
  return value === "ryport" || value === "supabase" ? value : null;
}

export function setRyportTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(AUTH_SOURCE_KEY, "ryport");
  document.cookie = `ryport_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function setSupabaseTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(AUTH_SOURCE_KEY, "supabase");
  document.cookie = `ryport_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/** @deprecated use setRyportTokens or setSupabaseTokens */
export function setTokens(access: string, refresh: string) {
  setRyportTokens(access, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(AUTH_SOURCE_KEY);
  document.cookie = "ryport_auth=; path=/; max-age=0";
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
