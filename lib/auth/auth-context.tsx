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
import { authApi } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import type { User, UserPlan } from "@/lib/api/types";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/tokens";

type AuthContextValue = {
  user: User | null;
  plan: UserPlan | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, totp?: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  startOAuth: (provider: "google" | "github") => Promise<void>;
  completeOAuth: (code: string, state: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (token: string) => {
    const [profile, userPlan] = await Promise.all([
      usersApi.me(token),
      usersApi.plan(token),
    ]);
    setUser(profile);
    setPlan(userPlan);
  }, []);

  const refreshSession = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (!access && !refresh) {
      setUser(null);
      setPlan(null);
      setIsLoading(false);
      return;
    }

    try {
      let token = access;
      if (!token && refresh) {
        const tokens = await authApi.refresh(refresh);
        setTokens(tokens.access, tokens.refresh);
        token = tokens.access;
      }
      if (token) await loadProfile(token);
    } catch {
      clearTokens();
      setUser(null);
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string, totp?: string) => {
      const data = await authApi.login({ email, password, totp_token: totp });
      setTokens(data.access, data.refresh);
      await loadProfile(data.access);
      router.push("/app/dashboard");
    },
    [loadProfile, router],
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const data = await authApi.register({ full_name: fullName, email, password });
      setTokens(data.access, data.refresh);
      await loadProfile(data.access);
      router.push("/app/dashboard");
    },
    [loadProfile, router],
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
    setUser(null);
    setPlan(null);
    router.push("/login");
  }, [router]);

  const startOAuth = useCallback(async (provider: "google" | "github") => {
    const redirectTo = `${window.location.origin}/oauth/callback`;
    const { url } = await authApi.startOAuth(provider, redirectTo);
    window.location.href = url;
  }, []);

  const completeOAuth = useCallback(
    async (code: string, state: string) => {
      const data = await authApi.oauthCallback(code, state);
      setTokens(data.access, data.refresh);
      await loadProfile(data.access);
      router.push("/app/dashboard");
    },
    [loadProfile, router],
  );

  const value = useMemo(
    () => ({
      user,
      plan,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshSession,
      startOAuth,
      completeOAuth,
    }),
    [
      user,
      plan,
      isLoading,
      login,
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
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
