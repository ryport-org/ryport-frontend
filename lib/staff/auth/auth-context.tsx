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
import { staffAuthApi } from "@/lib/staff/api";
import { StaffApiError } from "@/lib/staff/api/client";
import type { StaffPermissionKey, StaffUser } from "@/lib/staff/api/types";
import {
  clearStaffTokens,
  getStaffAccessToken,
  getStaffRefreshToken,
  setStaffTokens,
} from "@/lib/staff/auth/tokens";
import { staffPath } from "@/lib/staff/routes";
import { isStaffAuthError } from "@/lib/auth/session-utils";

type StaffAuthContextValue = {
  staffUser: StaffUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  can: (permission: StaffPermissionKey) => boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptInvite: (token: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateDepartment: (department: string) => Promise<void>;
};

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

export function getStaffAuthErrorMessage(err: unknown): string {
  if (err instanceof StaffApiError) {
    if (err.code === "login_locked") {
      return "Too many failed attempts. Try again in about 15 minutes.";
    }
    if (err.code === "invalid_credentials") {
      return "Invalid email or password, or this account does not have staff access. Staff login is separate from the customer app — use credentials created via staff invite or create_superadmin on the backend.";
    }
    if (err.code === "insufficient_permissions") {
      return "You do not have permission to perform this action.";
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const can = useCallback(
    (permission: StaffPermissionKey) => staffUser?.permissions[permission] ?? false,
    [staffUser],
  );

  const bootstrap = useCallback(async (token: string) => {
    const profile = await staffAuthApi.me(token);
    setStaffUser(profile);
    return profile;
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const access = getStaffAccessToken();
      const refresh = getStaffRefreshToken();

      if (!access && !refresh) {
        setStaffUser(null);
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
          if (!refresh || !isStaffAuthError(err)) return;
        }
      }

      if (refresh) {
        try {
          const tokens = await staffAuthApi.refresh(refresh);
          setStaffTokens(tokens.access, tokens.refresh ?? refresh);
          await loadProfile(tokens.access);
        } catch (err) {
          if (isStaffAuthError(err)) {
            clearStaffTokens();
            setStaffUser(null);
          }
        }
      }
    } catch (err) {
      if (isStaffAuthError(err)) {
        clearStaffTokens();
        setStaffUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [bootstrap]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await staffAuthApi.login(email.trim(), password);
      setStaffTokens(data.access, data.refresh);
      setStaffUser(data.staff_user);
      router.push(staffPath());
    },
    [router],
  );

  const acceptInvite = useCallback(
    async (token: string, password: string, firstName?: string, lastName?: string) => {
      const data = await staffAuthApi.acceptInvite({
        token,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      setStaffTokens(data.access, data.refresh);
      setStaffUser(data.staff_user);
      router.push(staffPath());
    },
    [router],
  );

  const logout = useCallback(async () => {
    const access = getStaffAccessToken();
    const refresh = getStaffRefreshToken();
    try {
      if (access && refresh) {
        await staffAuthApi.logout(refresh, access);
      }
    } catch {
      /* still clear locally */
    }
    clearStaffTokens();
    setStaffUser(null);
    router.push(staffPath("/login"));
  }, [router]);

  const updateDepartment = useCallback(async (department: string) => {
    const access = getStaffAccessToken();
    const updated = await staffAuthApi.updateMe({ department }, access);
    setStaffUser(updated);
  }, []);

  const value = useMemo(
    () => ({
      staffUser,
      isLoading,
      isAuthenticated: Boolean(staffUser) || Boolean(getStaffAccessToken()),
      can,
      login,
      acceptInvite,
      logout,
      refreshSession,
      updateDepartment,
    }),
    [
      staffUser,
      isLoading,
      can,
      login,
      acceptInvite,
      logout,
      refreshSession,
      updateDepartment,
    ],
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used within StaffAuthProvider");
  return ctx;
}
