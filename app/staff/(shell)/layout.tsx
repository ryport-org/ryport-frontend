import { StaffAuthGuard } from "@/components/staff/auth/auth-guard";
import { StaffShell } from "@/components/staff/shell/app-shell";

export default function StaffShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffAuthGuard>
      <StaffShell>{children}</StaffShell>
    </StaffAuthGuard>
  );
}
