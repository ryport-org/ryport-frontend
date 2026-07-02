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
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { authApi, businessesApi, notificationsApi, usersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { Business, PlanFeature, PlanResponse, Profile } from "@/lib/api/types";
import { startOAuthAction } from "@/lib/auth/oauth-actions";
import {
  getSupabaseAuthErrorMessage,
  isAuthError,
} from "@/lib/auth/supabase-errors";
import {
  clearTokens,
  getAccessToken,
  getAuthSource,
  getRefreshToken,
  setRyportTokens,
  setSupabaseTokens,
} from "@/lib/auth/tokens";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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

  const hydrateSupabaseSession = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = await getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return false;
      setSupabaseTokens(session.access_token, session.refresh_token);
      await bootstrap(session.access_token);
      return true;
    } catch {
      return false;
    }
  }, [bootstrap]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const source = getAuthSource();

      if (source === "supabase") {
        const ok = await hydrateSupabaseSession();
        if (!ok) {
          clearTokens();
          clearAppState();
        }
        return;
      }

      const access = getAccessToken();
      const refresh = getRefreshToken();

      if (source === "ryport" && (access || refresh)) {
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

      // OAuth callback may set Supabase cookies before localStorage is synced
      if (await hydrateSupabaseSession()) return;

      clearTokens();
      clearAppState();
    } catch {
      clearTokens();
      clearAppState();
    } finally {
      setIsLoading(false);
    }
  }, [bootstrap, clearAppState, hydrateSupabaseSession]);

  useEffect(() => {
    void refreshSession();

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void getSupabaseBrowserClient()
      .then((supabase) => {
        if (cancelled) return;
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          if (getAuthSource() !== "supabase") return;
          if (session) {
            setSupabaseTokens(session.access_token, session.refresh_token);
            try {
              await bootstrap(session.access_token);
            } catch {
              if (event !== "INITIAL_SESSION") clearAppState();
            }
          } else if (event === "SIGNED_OUT") {
            clearTokens();
            clearAppState();
          }
        });
        unsubscribe = () => subscription.unsubscribe();
      })
      .catch(() => {
        /* OAuth not configured — email/password auth still works */
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [bootstrap, clearAppState, refreshSession]);

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
    const source = getAuthSource();
    const access = getAccessToken();
    const refresh = getRefreshToken();

    try {
      if (source === "ryport" && access && refresh) {
        await authApi.logout(refresh, access);
      }
      if (source === "supabase") {
        const supabase = await getSupabaseBrowserClient();
        await supabase.auth.signOut();
      }
    } catch {
      /* still clear locally */
    }

    clearTokens();
    clearAppState();
    router.push("/login");
  }, [clearAppState, router]);

  const startOAuth = useCallback(async (provider: "google" | "github") => {
    await startOAuthAction(provider);
  }, []);

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
  if (isAuthError(error)) {
    return getSupabaseAuthErrorMessage(error);
  }
  if (error instanceof ApiError) {
    if (error.code === "invalid_credentials") {
      return "Invalid email or password. If you signed up with Google or GitHub, use those buttons below.";
    }
    if (error.code === "supabase_auth_error") {
      return error.message;
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
