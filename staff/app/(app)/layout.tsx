import { StaffAuthGuard } from "@/components/auth/auth-guard";
import { StaffShell } from "@/components/shell/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffAuthGuard>
      <StaffShell>{children}</StaffShell>
    </StaffAuthGuard>
  );
}
