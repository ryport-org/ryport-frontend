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
    <header className="border-b border-line bg-white px-6 py-5 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-mist">{greeting(user?.email?.split("@")[0])}</p>
          <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-mist">{description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
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
          <Button href="/app/transactions?new=1" variant="primary" className="gap-1.5">
            <Plus className="size-4" />
            Add transaction
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
