"use client";

import Link from "next/link";
import { Bell, Menu, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppShell } from "@/components/dashboard/app-shell-context";
import { useAuth } from "@/lib/auth/auth-context";
import { greeting } from "@/lib/format";

type AppHeaderProps = {
  title: string;
  description?: string;
  unreadCount?: number;
  action?: React.ReactNode;
};

export function AppHeader({
  title,
  description,
  unreadCount,
  action,
}: AppHeaderProps) {
  const { user, unreadNotifications } = useAuth();
  const { setMobileNavOpen } = useAppShell();
  const count = unreadCount ?? unreadNotifications;

  return (
    <header className="shrink-0 border-b border-line bg-white px-4 py-3 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-mist transition-colors hover:border-sky hover:text-sky lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-mist sm:text-sm">
              {greeting(user?.email?.split("@")[0])}
            </p>
            <h1 className="mt-0.5 font-display text-xl leading-tight text-ink sm:text-2xl lg:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-mist">{description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {action}
          <Link
            href="/app/notifications"
            className="relative inline-flex size-10 items-center justify-center rounded-lg border border-line text-mist transition-colors hover:border-sky hover:text-sky"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-sky text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            ) : null}
          </Link>
          <Button
            href="/app/transactions?new=1"
            variant="primary"
            className="inline-flex gap-1.5"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function PlanBadge() {
  const { plan } = useAuth();
  if (!plan) return null;
  return (
    <Badge variant={plan.plan === "advanced" ? "ink" : "sky"} className="capitalize">
      {plan.display_name ?? plan.plan}
    </Badge>
  );
}
