"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-paper">
        <AppSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
