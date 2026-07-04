"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/auth/auth-context";

export function StaffAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useStaffAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-muted">Loading staff session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}
