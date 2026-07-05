"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/staff/auth/auth-context";
import { staffPath } from "@/lib/staff/routes";

export function StaffAuthGuard({ children }: { children: React.ReactNode }) {
  const { staffUser, isLoading } = useStaffAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!staffUser) {
      router.replace(staffPath("/login"));
    }
  }, [isLoading, staffUser, router]);

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

  if (!staffUser) return null;

  return children;
}
