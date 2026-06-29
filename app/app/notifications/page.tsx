"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/api/types";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      setNotifications(await notificationsApi.list(token));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    const token = getAccessToken();
    if (!token) return;
    await notificationsApi.readAll(token);
    await load();
  }

  async function markRead(id: string) {
    const token = getAccessToken();
    if (!token) return;
    await notificationsApi.markRead(token, id);
    await load();
  }

  return (
    <>
      <AppHeader
        title="Notifications"
        description="Budget alerts, bill reminders, and weekly summaries"
        action={
          <Button variant="secondary" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-sm text-mist">You&apos;re all caught up.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id}>
                <Card
                  className={cn(
                    "transition-colors",
                    !n.is_read && "border-sky/30 bg-sky-soft/20",
                  )}
                >
                  <CardBody className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-ink">{n.title}</p>
                        <Badge variant="default" className="capitalize">
                          {n.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-mist">{n.message}</p>
                      <p className="mt-2 text-xs text-mist">
                        {formatRelativeDate(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read ? (
                      <Button variant="ghost" className="shrink-0 text-xs" onClick={() => markRead(n.id)}>
                        Mark read
                      </Button>
                    ) : null}
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
