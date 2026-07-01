"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const count = unreadCount ?? unreadNotifications;

  return (
    <header className="shrink-0 border-b border-line bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm text-mist">{greeting(user?.email?.split("@")[0])}</p>
          <h1 className="mt-0.5 font-display text-xl text-ink sm:text-2xl lg:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-mist">{description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
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
          <Button href="/app/transactions?new=1" variant="primary" className="hidden gap-1.5 sm:inline-flex">
            <Plus className="size-4" />
            <span className="hidden md:inline">Add transaction</span>
            <span className="md:hidden">Add</span>
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
