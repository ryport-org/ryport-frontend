"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { StaffPermissionKey } from "@/lib/staff/api/types";
import { useStaffAuth } from "@/lib/staff/auth/auth-context";
import { STAFF_BASE, staffPath } from "@/lib/staff/routes";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: StaffPermissionKey;
};

const NAV: NavItem[] = [
  { href: staffPath(), label: "Dashboard", icon: LayoutDashboard, permission: "can_view_dashboard" },
  { href: staffPath("/users"), label: "Users", icon: Users },
  { href: staffPath("/revenue"), label: "Revenue", icon: Wallet, permission: "can_view_revenue" },
  { href: staffPath("/analytics"), label: "Analytics", icon: BarChart3, permission: "can_view_analytics" },
  { href: staffPath("/support"), label: "Support", icon: ClipboardList, permission: "can_suspend_users" },
  { href: staffPath("/announcements"), label: "Announcements", icon: Bell, permission: "can_send_announcements" },
  { href: staffPath("/team"), label: "Staff", icon: Shield, permission: "can_manage_staff" },
  { href: staffPath("/audit"), label: "Audit log", icon: Activity, permission: "can_view_audit_log" },
  { href: staffPath("/system"), label: "System", icon: Wrench, permission: "can_view_system" },
  { href: staffPath("/settings"), label: "Settings", icon: Settings },
];

export function StaffSidebar() {
  const pathname = usePathname();
  const { staffUser, can, logout } = useStaffAuth();

  const visibleNav = NAV.filter((item) => !item.permission || can(item.permission));

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-4">
        <p className="text-sm font-semibold text-ink">Ryport Staff</p>
        <p className="mt-0.5 truncate text-xs text-muted">{staffUser?.email}</p>
        <p className="mt-1 text-xs capitalize text-muted">{staffUser?.role}</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {visibleNav.map((item) => {
          const active =
            item.href === STAFF_BASE
              ? pathname === STAFF_BASE
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-raised hover:text-ink"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
