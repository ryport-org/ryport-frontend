"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectToOpsDashboard } from "@/lib/auth/admin";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAdmin) {
      redirectToOpsDashboard();
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  if (isLoading || isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-line border-t-sky" />
          <p className="text-sm text-mist">
            {isAdmin ? "Opening ops dashboard…" : "Loading your dashboard…"}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}
