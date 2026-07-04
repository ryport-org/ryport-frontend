"use client";

import { StaffSidebar } from "@/components/staff/shell/sidebar";

export function StaffShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <StaffSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
