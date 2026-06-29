"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PieChart,
  Settings,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/app/transactions", label: "Transactions", icon: CreditCard },
  { href: "/app/accounts", label: "Accounts", icon: Wallet },
  { href: "/app/budgets", label: "Budgets", icon: PieChart },
  { href: "/app/reports", label: "Reports", icon: FileText },
  { href: "/app/ai", label: "AI Assistant", icon: MessageSquare },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/businesses", label: "Businesses", icon: Building2 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, plan, logout } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-white">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <Link href="/app/dashboard" className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-paper">
            <Image src="/logo.png" alt="" width={22} height={22} className="object-contain" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">Ryport</p>
            <p className="truncate text-[11px] capitalize text-mist">
              {plan?.tier ?? "free"} plan
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="App">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sky-soft text-sky"
                  : "text-mist hover:bg-paper hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <div className="mb-3 truncate px-1">
          <p className="truncate text-sm font-medium text-ink">
            {user?.full_name ?? user?.email}
          </p>
          <p className="truncate text-xs text-mist">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-mist transition-colors hover:bg-paper hover:text-ink"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
