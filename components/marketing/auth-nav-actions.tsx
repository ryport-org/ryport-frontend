"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { isAdminUser } from "@/lib/auth/admin";
import { useStaffAuth } from "@/lib/staff/auth/auth-context";
import { staffPath } from "@/lib/staff/routes";
import { cn } from "@/lib/utils";

type AuthNavActionsProps = {
  className?: string;
  linkClassName?: string;
  primaryClassName?: string;
  onNavigate?: () => void;
  showRegister?: boolean;
};

export function AuthNavActions({
  className,
  linkClassName,
  primaryClassName,
  onNavigate,
  showRegister = true,
}: AuthNavActionsProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAuthenticated: staffAuthenticated, isLoading: staffLoading } = useStaffAuth();

  const loading = isLoading || staffLoading;

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="hidden h-9 w-16 animate-pulse rounded-full bg-white/10 xl:inline-block" />
        {showRegister ? (
          <span className="inline-flex h-9 w-24 animate-pulse rounded-full bg-white/20" />
        ) : null}
      </div>
    );
  }

  if (staffAuthenticated) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Link
          href={staffPath()}
          onClick={onNavigate}
          className={cn(
            "inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition-opacity hover:opacity-90 sm:px-5 sm:text-sm",
            primaryClassName,
          )}
        >
          Dashboard
        </Link>
      </div>
    );
  }

  if (isAuthenticated) {
    const href = isAdminUser(user) ? staffPath("/login") : "/app/dashboard";
    const label = isAdminUser(user) ? "Staff dashboard" : "Dashboard";

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Link
          href={href}
          onClick={onNavigate}
          className={cn(
            "inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition-opacity hover:opacity-90 sm:px-5 sm:text-sm",
            primaryClassName,
          )}
        >
          {label}
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link
        href="/login"
        onClick={onNavigate}
        className={cn(
          "hidden rounded-full px-3 py-1.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white xl:inline-flex",
          linkClassName,
        )}
      >
        Sign in
      </Link>
      {showRegister ? (
        <Link
          href="/register"
          onClick={onNavigate}
          className={cn(
            "inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition-opacity hover:opacity-90 sm:px-5 sm:text-sm",
            primaryClassName,
          )}
        >
          Get started
        </Link>
      ) : null}
    </div>
  );
}
