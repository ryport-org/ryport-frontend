"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
// OAuth temporarily disabled — re-enable with SocialLogins + OAuthHandler
import { aiApi, authApi, businessesApi, notificationsApi, usersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type {
  AIQuota,
  Business,
  PlanFeature,
  PlanResponse,
  Profile,
} from "@/lib/api/types";
import { clearOAuthSession } from "@/lib/auth/oauth-session";
import { isAdminUser } from "@/lib/auth/admin";
import { isCustomerAuthError } from "@/lib/auth/session-utils";
import { isStaffAppPath, staffPath } from "@/lib/staff/routes";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setRyportTokens,
} from "@/lib/auth/tokens";

type AuthContextValue = {
  user: Profile | null;
  plan: PlanResponse | null;
  unreadNotifications: number;
  activeBusiness: Business | null;
  aiQuota: AIQuota | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canUse: (feature: string) => boolean;
  getLimit: (key: string) => number | null;
  login: (email: string, password: string, totp?: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshAiQuota: () => Promise<void>;
  // OAuth temporarily disabled
  // startOAuth: (provider: "google" | "github") => Promise<void>;
  // loadSessionAfterOAuth: (access: string) => Promise<void>;
  // exchangeOAuthCode: (code: string, state: string, totp?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function featureMap(features: PlanFeature[] | undefined) {
  const map = new Map<string, PlanFeature>();
  features?.forEach((f) => map.set(f.name, f));
  return map;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [aiQuota, setAiQuota] = useState<AIQuota | null>(null);
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

  const isAdmin = useMemo(() => isAdminUser(user), [user]);

  const clearAppState = useCallback(() => {
    setUser(null);
    setPlan(null);
    setUnreadNotifications(0);
    setActiveBusiness(null);
    setAiQuota(null);
  }, []);

  /** Post-login bootstrap — see docs/frontend-dev-handoff.md §3 */
  const bootstrap = useCallback(async (token: string) => {
    const [profile, userPlan, unread, active, quota] = await Promise.all([
      usersApi.me(token),
      usersApi.plan(token),
      notificationsApi.unreadCount(token).catch(() => ({ count: 0 })),
      businessesApi.active(token).catch(() => null),
      aiApi.quota(token).catch(() => null),
    ]);
    setUser(profile);
    setPlan(userPlan);
    setUnreadNotifications(unread.count);
    setActiveBusiness(active);
    setAiQuota(quota);
    return profile;
  }, []);

  const finishCustomerLogin = useCallback(
    (profile: Profile) => {
      if (isAdminUser(profile)) {
        router.push(staffPath("/login"));
        return;
      }
      router.push("/app/dashboard");
    },
    [router],
  );

  const refreshSession = useCallback(async () => {
    if (isStaffAppPath(pathname)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const access = getAccessToken();
      const refresh = getRefreshToken();

      if (!access && !refresh) {
        clearAppState();
        return;
      }

      const loadProfile = async (token: string) => {
        await bootstrap(token);
      };

      if (access) {
        try {
          await loadProfile(access);
          return;
        } catch (err) {
          if (!refresh || !isCustomerAuthError(err)) return;
        }
      }

      if (refresh) {
        try {
          const tokens = await authApi.refresh(refresh);
          setRyportTokens(tokens.access, tokens.refresh);
          await loadProfile(tokens.access);
        } catch (err) {
          if (isCustomerAuthError(err)) {
            clearTokens();
            clearAppState();
          }
        }
      }
    } catch (err) {
      if (isCustomerAuthError(err)) {
        clearTokens();
        clearAppState();
      }
    } finally {
      setIsLoading(false);
    }
  }, [bootstrap, clearAppState, pathname]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string, totp?: string) => {
      const data = await authApi.login({ email, password, totp_token: totp });
      setRyportTokens(data.access, data.refresh);
      const profile = await bootstrap(data.access);
      finishCustomerLogin(profile);
    },
    [bootstrap, finishCustomerLogin],
  );

  const requestOtp = useCallback(async (email: string) => {
    await authApi.requestOtp(email);
  }, []);

  const loginWithOtp = useCallback(
    async (email: string, otp: string) => {
      const data = await authApi.verifyOtp(email, otp);
      setRyportTokens(data.access, data.refresh);
      const profile = await bootstrap(data.access);
      finishCustomerLogin(profile);
    },
    [bootstrap, finishCustomerLogin],
  );

  const register = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      const data = await authApi.register({
        email,
        password,
        password_confirm: passwordConfirm,
      });
      setRyportTokens(data.access, data.refresh);
      const profile = await bootstrap(data.access);
      finishCustomerLogin(profile);
    },
    [bootstrap, finishCustomerLogin],
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

  /*
  const startOAuth = useCallback(async (provider: "google" | "github") => {
    const { url, state } = await authApi.startOAuth(provider, OAUTH_NEXT_PATH);
    storeOAuthSession(state, provider);
    window.location.href = url;
  }, []);

  const loadSessionAfterOAuth = useCallback(
    async (access: string) => {
      clearOAuthSession();
      const token = getAccessToken() ?? access;
      try {
        await authApi.syncSession(token);
      } catch {
        // tokens already saved from redirect URL
      }
      await bootstrap(token);
      setIsLoading(false);
    },
    [bootstrap],
  );

  const exchangeOAuthCode = useCallback(
    async (code: string, state: string, totp?: string) => {
      const data = await authApi.completeOAuth({
        code,
        state,
        totp_token: totp,
      });
      setRyportTokens(data.access, data.refresh);
      clearOAuthSession();
      await bootstrap(data.access);
      setIsLoading(false);
    },
    [bootstrap],
  );
  */

  const refreshAiQuota = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setAiQuota(null);
      return;
    }
    const quota = await aiApi.quota(token).catch(() => null);
    setAiQuota(quota);
  }, []);

  const value = useMemo(
    () => ({
      user,
      plan,
      unreadNotifications,
      activeBusiness,
      aiQuota,
      isLoading,
      isAuthenticated: Boolean(user) || Boolean(getAccessToken()),
      isAdmin,
      canUse,
      getLimit,
      login,
      loginWithOtp,
      requestOtp,
      register,
      logout,
      refreshSession,
      refreshAiQuota,
      // startOAuth,
      // loadSessionAfterOAuth,
      // exchangeOAuthCode,
    }),
    [
      user,
      plan,
      unreadNotifications,
      activeBusiness,
      aiQuota,
      isLoading,
      isAdmin,
      canUse,
      getLimit,
      login,
      loginWithOtp,
      requestOtp,
      register,
      logout,
      refreshSession,
      refreshAiQuota,
      // startOAuth,
      // loadSessionAfterOAuth,
      // exchangeOAuthCode,
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
      return "Invalid email or password.";
    }
    if (error.code === "quota_exceeded") {
      return error.message || "You have reached your daily AI message limit.";
    }
    if (error.code === "feature_not_available") {
      return error.message || "This feature is not on your current plan.";
    }
    /*
    if (error.code === "oauth_state_mismatch" || error.code === "missing_oauth_state") {
      return "OAuth session expired. Please try signing in again.";
    }
    */
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
