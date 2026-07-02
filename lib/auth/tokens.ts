/** Canonical keys — must match backend / OAuth redirect expectations. */
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

/** Legacy keys from earlier frontend builds. */
const LEGACY_ACCESS_KEY = "ryport_access_token";
const LEGACY_REFRESH_KEY = "ryport_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(ACCESS_KEY) ?? localStorage.getItem(LEGACY_ACCESS_KEY)
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(REFRESH_KEY) ?? localStorage.getItem(LEGACY_REFRESH_KEY)
  );
}

/** Save tokens synchronously — call before any authenticated API request after OAuth. */
export function setRyportTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.removeItem(LEGACY_ACCESS_KEY);
  localStorage.removeItem(LEGACY_REFRESH_KEY);
  document.cookie = `ryport_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/** @deprecated use setRyportTokens */
export function setTokens(access: string, refresh: string) {
  setRyportTokens(access, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(LEGACY_ACCESS_KEY);
  localStorage.removeItem(LEGACY_REFRESH_KEY);
  document.cookie = "ryport_auth=; path=/; max-age=0";
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function hasOAuthRedirectParams(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return (
    (params.get("oauth") === "success" && Boolean(params.get("access"))) ||
    Boolean(params.get("code"))
  );
}

export function stripOAuthQueryParams() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", window.location.pathname);
}
