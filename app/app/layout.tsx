import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/dashboard/app-shell";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Dashboard",
  description: "Your Ryport financial dashboard.",
  path: "/app",
  noIndex: true,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
