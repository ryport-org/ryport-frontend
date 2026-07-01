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
import type { Provider } from "@supabase/supabase-js";
import { OAUTH_CALLBACK_URL } from "@/lib/config";
import { businessesApi, notificationsApi, usersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { Business, PlanFeature, PlanResponse, Profile } from "@/lib/api/types";
import {
  getSupabaseAuthErrorMessage,
  isAuthError,
} from "@/lib/auth/supabase-errors";
import { clearTokens, syncSessionTokens } from "@/lib/auth/tokens";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: Profile | null;
  plan: PlanResponse | null;
  unreadNotifications: number;
  activeBusiness: Business | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canUse: (feature: string) => boolean;
  getLimit: (key: string) => number | null;
  login: (email: string, password: string) => Promise<void>;
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

  const supabase = useMemo(() => createClient(), []);

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

  const hydrateFromSupabase = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          clearTokens();
          clearAppState();
          return;
        }

        syncSessionTokens(session);
        await bootstrap(session.access_token);
      } catch {
        clearTokens();
        clearAppState();
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [bootstrap, clearAppState, supabase.auth],
  );

  useEffect(() => {
    void hydrateFromSupabase(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        syncSessionTokens(session);
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

    return () => subscription.unsubscribe();
  }, [bootstrap, clearAppState, hydrateFromSupabase, supabase.auth]);

  const refreshSession = useCallback(async () => {
    await hydrateFromSupabase(true);
  }, [hydrateFromSupabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.session) {
        throw new Error("Sign in succeeded but no session was returned.");
      }
      syncSessionTokens(data.session);
      await bootstrap(data.session.access_token);
      router.push("/app/dashboard");
    },
    [bootstrap, router, supabase.auth],
  );

  const requestOtp = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
    },
    [supabase.auth],
  );

  const loginWithOtp = useCallback(
    async (email: string, otp: string) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;
      if (!data.session) {
        throw new Error("Verification succeeded but no session was returned.");
      }
      syncSessionTokens(data.session);
      await bootstrap(data.session.access_token);
      router.push("/app/dashboard");
    },
    [bootstrap, router, supabase.auth],
  );

  const register = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      if (password !== passwordConfirm) {
        throw new Error("Passwords do not match.");
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.session) {
        throw new Error(
          "Account created. Check your email to confirm your address, then log in.",
        );
      }
      syncSessionTokens(data.session);
      await bootstrap(data.session.access_token);
      router.push("/app/dashboard");
    },
    [bootstrap, router, supabase.auth],
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* still clear locally */
    }
    clearTokens();
    clearAppState();
    router.push("/login");
  }, [clearAppState, router, supabase.auth]);

  const startOAuth = useCallback(
    async (provider: "google" | "github") => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: OAUTH_CALLBACK_URL,
        },
      });
      if (error) throw error;
    },
    [supabase.auth],
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
