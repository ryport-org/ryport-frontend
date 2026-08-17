"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/app/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/app/transactions", label: "Transactions", icon: CreditCard },
  { href: "/app/ai", label: "AI Hub", icon: MessageSquare },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { unreadNotifications } = useAuth();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around border-t border-line bg-white/95 backdrop-blur-md px-2 lg:hidden"
      aria-label="Mobile navigation"
    >
      {mobileNavItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/app/dashboard" &&
            item.href !== "/app/ai" &&
            pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        const showBadge =
          item.href === "/app/notifications" && unreadNotifications > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors",
              active ? "text-sky font-semibold" : "text-mist hover:text-ink"
            )}
          >
            <div className="relative">
              <Icon className="size-5" />
              {showBadge ? (
                <span className="absolute -top-1 -right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              ) : null}
            </div>
            <span className="mt-1 text-[11px] truncate max-w-[64px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
