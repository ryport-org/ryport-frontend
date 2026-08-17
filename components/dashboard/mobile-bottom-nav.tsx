"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  Sparkles,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/app/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/app/transactions", label: "Transactions", icon: CreditCard },
  { href: "/app/ai", label: "AI Hub", icon: Sparkles, isCenter: true },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { unreadNotifications } = useAuth();

  return (
    <nav
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-6 sm:right-6 z-40 lg:hidden mx-auto max-w-md"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-center justify-around rounded-2xl sm:rounded-3xl border border-line/80 bg-white/95 backdrop-blur-xl shadow-xl shadow-ink/10 px-2 py-1">
        {mobileNavItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/app/dashboard" &&
              item.href !== "/app/ai" &&
              pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          const showBadge =
            item.href === "/app/notifications" && unreadNotifications > 0;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex flex-col items-center justify-center transition-transform active:scale-95"
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 border-2 border-white",
                    active
                      ? "bg-sky text-white ring-4 ring-sky/20"
                      : "bg-brand text-white hover:bg-brand/90"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <span className="mt-1 text-[10px] font-semibold text-ink truncate max-w-[64px]">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center py-1 text-center rounded-xl transition-all duration-200",
                active
                  ? "text-sky font-semibold bg-sky-soft/60"
                  : "text-mist hover:text-ink hover:bg-paper/80"
              )}
            >
              <div className="relative">
                <Icon className="size-5" />
                {showBadge ? (
                  <span className="absolute -top-1 -right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white shadow-sm">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                ) : null}
              </div>
              <span className="mt-1 text-[10px] truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
