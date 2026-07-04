const ACCESS_KEY = "staff_access_token";
const REFRESH_KEY = "staff_refresh_token";
const AUTH_COOKIE = "staff_auth";

export function getStaffAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getStaffRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setStaffTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearStaffTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
}

export function hasStaffSessionHint(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(getStaffAccessToken() || getStaffRefreshToken());
}
