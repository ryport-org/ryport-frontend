const OAUTH_STATE_KEY = "ryport_oauth_state";
const OAUTH_PROVIDER_KEY = "ryport_oauth_provider";

export function storeOAuthSession(state: string, provider: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  sessionStorage.setItem(OAUTH_PROVIDER_KEY, provider);
}

export function readOAuthSession(): { state: string | null; provider: string | null } {
  if (typeof window === "undefined") return { state: null, provider: null };
  return {
    state: sessionStorage.getItem(OAUTH_STATE_KEY),
    provider: sessionStorage.getItem(OAUTH_PROVIDER_KEY),
  };
}

export function clearOAuthSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_PROVIDER_KEY);
}

export function validateOAuthState(returnedState: string | null): boolean {
  const { state: stored } = readOAuthSession();
  if (!stored || !returnedState) return false;
  return stored === returnedState;
}
