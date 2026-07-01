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
  Sparkles,
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
  { href: "/app/ai", label: "AI Hub", icon: MessageSquare },
  { href: "/app/ai/chat", label: "AI Chat", icon: Sparkles, nested: true },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  {
    href: "/app/businesses",
    label: "Businesses",
    icon: Building2,
    feature: "multi_business",
  },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, plan, logout, canUse, unreadNotifications } = useAuth();

  const visibleNav = navItems.filter((item) => {
    if ("feature" in item && item.feature && !canUse(item.feature)) return false;
    return true;
  });

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-line bg-white">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line px-5 py-4">
        <Link href="/app/dashboard" className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper">
            <Image src="/logo.png" alt="" width={20} height={20} className="object-contain" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">Ryport</p>
            <p className="truncate text-[11px] capitalize text-mist">
              {plan?.display_name ?? plan?.plan ?? "free"} plan
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden px-3 py-2" aria-label="App">
        {visibleNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/app/ai" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          const showBadge = item.href === "/app/notifications" && unreadNotifications > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sky-soft text-sky"
                  : "text-mist hover:bg-paper hover:text-ink",
                item.nested && "ml-2 text-[13px]",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {showBadge ? (
                <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line p-4">
        {plan?.plan === "free" || plan?.plan === "pro" ? (
          <Link
            href="/app/upgrade"
            className="mb-3 block rounded-lg border border-line bg-paper px-3 py-2 text-center text-xs font-semibold text-brand transition-colors hover:bg-sky-soft"
          >
            Upgrade plan
          </Link>
        ) : null}
        <p className="truncate px-1 text-sm font-medium text-ink">{user?.email}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-mist transition-colors hover:bg-paper hover:text-ink"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
