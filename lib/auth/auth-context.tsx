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
import { aiApi, authApi, businessesApi, notificationsApi, usersApi } from "@/lib/api";
import type {
  AIQuota,
  Business,
  DashboardContext,
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
import { getErrorMessage } from "@/lib/errors/messages";
import { logAuthError } from "@/lib/errors/logger";

type AuthContextValue = {
  user: Profile | null;
  plan: PlanResponse | null;
  unreadNotifications: number;
  activeBusiness: Business | null;
  aiQuota: AIQuota | null;
  dashboardContext: DashboardContext | null;
  bootstrapWarning: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canUse: (feature: string) => boolean;
  getLimit: (key: string) => number | null;
  login: (email: string, password: string, totp?: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  registerUser: (payload: {
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshAiQuota: () => Promise<void>;
  bootstrap: (token: string) => Promise<Profile>;
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
  const [dashboardContext, setDashboardContext] = useState<DashboardContext | null>(null);
  const [bootstrapWarning, setBootstrapWarning] = useState<string | null>(null);
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
    setDashboardContext(null);
    setBootstrapWarning(null);
  }, []);

  /** Post-login bootstrap — see docs/frontend-dev-handoff.md §3 */
  const bootstrap = useCallback(async (token: string) => {
    setBootstrapWarning(null);
    let profile: Profile;
    try {
      profile = await usersApi.me(token);
    } catch (err) {
      logAuthError(err, "/users/me/");
      throw err;
    }

    // Resilient parallel loading of non-critical bootstrap data via Promise.allSettled
    const [userPlanResult, unreadResult, activeBizResult, quotaResult, dashCtxResult] =
      await Promise.allSettled([
        usersApi.plan(token),
        notificationsApi.unreadCount(token),
        businessesApi.active(token),
        aiApi.quota(token),
        usersApi.getDashboardContext(token),
      ]);

    const userPlan = userPlanResult.status === "fulfilled" ? userPlanResult.value : null;
    const unreadCount = unreadResult.status === "fulfilled" ? unreadResult.value.count : 0;
    const activeBiz = activeBizResult.status === "fulfilled" ? activeBizResult.value : null;
    const quota = quotaResult.status === "fulfilled" ? quotaResult.value : null;
    const dashCtx = dashCtxResult.status === "fulfilled" ? dashCtxResult.value : null;

    setUser(profile);
    setPlan(userPlan);
    setUnreadNotifications(unreadCount);
    setActiveBusiness(activeBiz || dashCtx?.active_business || null);
    setAiQuota(quota);
    setDashboardContext(dashCtx);

    if (userPlanResult.status === "rejected") {
      logAuthError(userPlanResult.reason, "/users/me/plan/");
      setBootstrapWarning("Some account details couldn't load.");
    }

    return profile;
  }, []);

  const finishCustomerLogin = useCallback(
    (profile: Profile, dashCtx?: DashboardContext | null) => {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string, totp?: string) => {
      try {
        const data = await authApi.login({ email, password, totp_token: totp });
        setRyportTokens(data.access, data.refresh);
        const profile = await bootstrap(data.access);
        finishCustomerLogin(profile);
      } catch (err) {
        logAuthError(err, "/users/auth/login/");
        throw err;
      }
    },
    [bootstrap, finishCustomerLogin],
  );

  const requestOtp = useCallback(async (email: string) => {
    try {
      await authApi.requestOtp(email);
    } catch (err) {
      logAuthError(err, "/users/auth/otp/request/");
      throw err;
    }
  }, []);

  const loginWithOtp = useCallback(
    async (email: string, otp: string) => {
      try {
        const data = await authApi.verifyOtp(email, otp);
        setRyportTokens(data.access, data.refresh);
        const profile = await bootstrap(data.access);
        finishCustomerLogin(profile);
      } catch (err) {
        logAuthError(err, "/users/auth/otp/verify/");
        throw err;
      }
    },
    [bootstrap, finishCustomerLogin],
  );

  const registerUser = useCallback(
    async (payload: {
      email: string;
      password: string;
      password_confirm: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string;
    }) => {
      try {
        const data = await authApi.register(payload);
        setRyportTokens(data.access, data.refresh);
        // Step 1 success -> redirect to Step 2 onboarding segment survey
        router.push("/onboarding/segment");
      } catch (err) {
        logAuthError(err, "/users/auth/register/");
        throw err;
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    try {
      if (access && refresh) {
        await authApi.logout(refresh, access);
      }
    } catch (err) {
      logAuthError(err, "/users/auth/logout/");
    }

    clearTokens();
    clearOAuthSession();
    clearAppState();
    router.push("/login");
  }, [clearAppState, router]);

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
      dashboardContext,
      bootstrapWarning,
      isLoading,
      isAuthenticated: Boolean(user) || Boolean(getAccessToken()),
      isAdmin,
      canUse,
      getLimit,
      login,
      loginWithOtp,
      requestOtp,
      registerUser,
      logout,
      refreshSession,
      refreshAiQuota,
      bootstrap,
    }),
    [
      user,
      plan,
      unreadNotifications,
      activeBusiness,
      aiQuota,
      dashboardContext,
      bootstrapWarning,
      isLoading,
      isAdmin,
      canUse,
      getLimit,
      login,
      loginWithOtp,
      requestOtp,
      registerUser,
      logout,
      refreshSession,
      refreshAiQuota,
      bootstrap,
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
  return getErrorMessage(error).message;
}
