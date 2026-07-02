"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { OAUTH_CALLBACK_URL } from "@/lib/config";
import { authApi, businessesApi, notificationsApi, usersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { Business, PlanFeature, PlanResponse, Profile } from "@/lib/api/types";
import { storeOAuthSession, clearOAuthSession } from "@/lib/auth/oauth-session";
import {
  clearTokens,
  getAccessToken,
  getAuthSource,
  getRefreshToken,
  setRyportTokens,
} from "@/lib/auth/tokens";

type AuthContextValue = {
  user: Profile | null;
  plan: PlanResponse | null;
  unreadNotifications: number;
  activeBusiness: Business | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canUse: (feature: string) => boolean;
  getLimit: (key: string) => number | null;
  login: (email: string, password: string, totp?: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  startOAuth: (provider: "google" | "github") => Promise<void>;
  completeOAuth: (code: string, state: string, totp?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function featureMap(features: PlanFeature[] | undefined) {
  const map = new Map<string, PlanFeature>();
  features?.forEach((f) => map.set(f.name, f));
  return map;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const features = useMemo(() => featureMap(plan?.features), [plan?.features]);

  const canUse = useCallback(
    (feature: string) => features.get(feature)?.enabled ?? false,
    [features],
  );

  const getLimit = useCallback(
    (key: string) => features.get(key)?.limit ?? null,
    [features],
  );

  const clearAppState = useCallback(() => {
    setUser(null);
    setPlan(null);
    setUnreadNotifications(0);
    setActiveBusiness(null);
  }, []);

  const bootstrap = useCallback(async (token: string) => {
    const [profile, userPlan, unread, active] = await Promise.all([
      usersApi.me(token),
      usersApi.plan(token),
      notificationsApi.unreadCount(token).catch(() => ({ count: 0 })),
      businessesApi.active(token).catch(() => null),
    ]);
    setUser(profile);
    setPlan(userPlan);
    setUnreadNotifications(unread.count);
    setActiveBusiness(active);
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const access = getAccessToken();
      const refresh = getRefreshToken();

      if (access || refresh) {
        let token = access;
        if (!token && refresh) {
          const tokens = await authApi.refresh(refresh);
          setRyportTokens(tokens.access, tokens.refresh);
          token = tokens.access;
        }
        if (token) {
          await bootstrap(token);
          return;
        }
      }

      clearTokens();
      clearAppState();
    } catch {
      clearTokens();
      clearAppState();
    } finally {
      setIsLoading(false);
    }
  }, [bootstrap, clearAppState]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string, totp?: string) => {
      const data = await authApi.login({ email, password, totp_token: totp });
      setRyportTokens(data.access, data.refresh);
      await bootstrap(data.access);
      router.push("/app/dashboard");
    },
    [bootstrap, router],
  );

  const requestOtp = useCallback(async (email: string) => {
    await authApi.requestOtp(email);
  }, []);

  const loginWithOtp = useCallback(
    async (email: string, otp: string) => {
      const data = await authApi.verifyOtp(email, otp);
      setRyportTokens(data.access, data.refresh);
      await bootstrap(data.access);
      router.push("/app/dashboard");
    },
    [bootstrap, router],
  );

  const register = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      const data = await authApi.register({
        email,
        password,
        password_confirm: passwordConfirm,
      });
      setRyportTokens(data.access, data.refresh);
      await bootstrap(data.access);
      router.push("/app/dashboard");
    },
    [bootstrap, router],
  );

  const logout = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    try {
      if (access && refresh) {
        await authApi.logout(refresh, access);
      }
    } catch {
      /* still clear locally */
    }

    clearTokens();
    clearOAuthSession();
    clearAppState();
    router.push("/login");
  }, [clearAppState, router]);

  const startOAuth = useCallback(async (provider: "google" | "github") => {
    const { url, state } = await authApi.startOAuth(provider, OAUTH_CALLBACK_URL);
    storeOAuthSession(state, provider);
    window.location.assign(url);
  }, []);

  const completeOAuth = useCallback(
    async (code: string, state: string, totp?: string) => {
      const data = await authApi.completeOAuth({
        code,
        state,
        totp_token: totp,
      });
      setRyportTokens(data.access, data.refresh);
      clearOAuthSession();
      await bootstrap(data.access);
      router.push("/app/dashboard");
    },
    [bootstrap, router],
  );

  const value = useMemo(
    () => ({
      user,
      plan,
      unreadNotifications,
      activeBusiness,
      isLoading,
      isAuthenticated: Boolean(user),
      canUse,
      getLimit,
      login,
      loginWithOtp,
      requestOtp,
      register,
      logout,
      refreshSession,
      startOAuth,
      completeOAuth,
    }),
    [
      user,
      plan,
      unreadNotifications,
      activeBusiness,
      isLoading,
      canUse,
      getLimit,
      login,
      loginWithOtp,
      requestOtp,
      register,
      logout,
      refreshSession,
      startOAuth,
      completeOAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "invalid_credentials") {
      return "Invalid email or password. If you signed up with Google or GitHub, use those buttons below.";
    }
    if (error.code === "supabase_auth_error") {
      return error.message;
    }
    if (error.code === "oauth_state_mismatch") {
      return "OAuth session expired. Please try signing in again.";
    }
    if (error.details && typeof error.details === "object") {
      const fieldMessages = Object.entries(error.details)
        .flatMap(([field, msgs]) => {
          if (Array.isArray(msgs)) return msgs.map((m) => `${field}: ${m}`);
          if (typeof msgs === "string") return [`${field}: ${msgs}`];
          return [];
        })
        .filter(Boolean);
      if (fieldMessages.length > 0) {
        return fieldMessages.join(" ");
      }
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
