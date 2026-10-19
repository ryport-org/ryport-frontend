"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, HandCoins, Sparkles } from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { debtsApi, notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/api/types";
import { formatNaira, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  async function handleConfirmDebtMatch(notification: Notification) {
    const token = getAccessToken();
    if (!token) return;

    const debtId = notification.metadata?.debt_id;
    const transactionId = notification.metadata?.transaction_id;

    if (!debtId || !transactionId) {
      // Just mark read if metadata missing
      await markRead(notification.id);
      return;
    }

    setConfirmingId(notification.id);
    try {
      await debtsApi.confirmMatch(token, debtId, {
        transaction_id: transactionId,
      });
      await notificationsApi.markRead(token, notification.id).catch(() => {});
      setSuccessToast(
        `Payment match confirmed for ${notification.metadata?.debtor_name || "debtor"}!`,
      );
      setTimeout(() => setSuccessToast(null), 4000);
      await load();
    } catch {
      alert("Failed to confirm match. The debt or transaction may have already been updated.");
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <AppPage>
      <AppHeader
        title="Notifications"
        description="Budget alerts, bill reminders, and 1-click payment confirmations"
        action={
          <Button variant="secondary" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      <AppPageBody>
        <AppPageContent>
          {successToast && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

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
              {notifications.map((n) => {
                const isDebtMatch =
                  n.type === "debt_payment_match" || n.type === "DEBT_PAYMENT_MATCH";

                return (
                  <li key={n.id}>
                    <Card
                      className={cn(
                        "transition-colors",
                        isDebtMatch
                          ? "border-amber-300 bg-amber-50/50"
                          : !n.is_read && "border-sky/30 bg-sky-soft/20",
                      )}
                    >
                      <CardBody className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 sm:p-5">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {isDebtMatch && (
                              <div className="flex size-6 items-center justify-center rounded-md bg-amber-600 text-white">
                                <HandCoins className="size-3.5" />
                              </div>
                            )}
                            <p className="font-semibold text-ink text-sm sm:text-base">{n.title}</p>
                            <Badge
                              variant={isDebtMatch ? "default" : "default"}
                              className={cn(
                                "capitalize text-[10px]",
                                isDebtMatch && "bg-amber-100 text-amber-800 border-amber-300",
                              )}
                            >
                              {isDebtMatch ? "Debt Payment Match" : n.type.replace(/_/g, " ")}
                            </Badge>
                          </div>

                          <p className="mt-1.5 text-xs sm:text-sm text-ink/90 leading-relaxed">
                            {n.body || n.message}
                          </p>

                          {isDebtMatch && n.metadata && (
                            <div className="mt-3 rounded-lg bg-white/80 border border-amber-200 p-2.5 text-xs text-ink/80 flex flex-wrap gap-x-4 gap-y-1">
                              {n.metadata.debtor_name && (
                                <span>
                                  <strong>Debtor:</strong> {n.metadata.debtor_name}
                                </span>
                              )}
                              {n.metadata.transaction_amount_kobo != null && (
                                <span>
                                  <strong>Credit Amount:</strong>{" "}
                                  {formatNaira(n.metadata.transaction_amount_kobo)}
                                </span>
                              )}
                              {n.metadata.debt_remaining_kobo != null && (
                                <span>
                                  <strong>Remaining Balance:</strong>{" "}
                                  {formatNaira(n.metadata.debt_remaining_kobo)}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="mt-2 text-xs text-mist">
                            {formatRelativeDate(n.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {isDebtMatch && !n.is_read ? (
                            <Button
                              variant="primary"
                              disabled={confirmingId === n.id}
                              onClick={() => handleConfirmDebtMatch(n)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 px-3 flex items-center gap-1.5"
                            >
                              <Sparkles className="size-3.5" />
                              {confirmingId === n.id ? "Confirming…" : "Yes, Confirm Match"}
                            </Button>
                          ) : null}

                          {!n.is_read ? (
                            <Button
                              variant="ghost"
                              className="text-xs py-1 px-2 text-mist hover:text-ink"
                              onClick={() => markRead(n.id)}
                            >
                              Mark read
                            </Button>
                          ) : null}
                        </div>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
