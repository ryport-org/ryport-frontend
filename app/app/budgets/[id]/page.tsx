"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokens";
import { budgetsApi } from "@/lib/api";
import type { Budget, BudgetUsage } from "@/lib/api/types";
import { AlertTriangle, AlertCircle, Info, Bell, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNaira } from "@/lib/format";

export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [usage, setUsage] = useState<BudgetUsage | null>(null);
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    Promise.all([
      budgetsApi.get(token, id),
      budgetsApi.usage(token, id),
      budgetsApi.alerts(token, id).catch(() => []),
    ])
      .then(([b, u, a]) => {
        setBudget(b);
        setUsage(u);
        setAlerts(a);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function checkAlerts() {
    const token = getAccessToken();
    if (!token || !id) return;
    await budgetsApi.checkAlerts(token, id);
    setAlerts(await budgetsApi.alerts(token, id));
  }

  if (loading) {
    return (
      <AppPage>
        <AppHeader title="Budget" />
        <AppPageBody>
          <AppPageContent>
            <Skeleton className="h-48" />
          </AppPageContent>
        </AppPageBody>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppHeader
        title={budget?.category ?? "Budget"}
        description={`${budget?.period ?? "monthly"} budget`}
      />
      <AppPageBody>
        <AppPageContent>
          {usage ? (
            <Card>
              <CardBody>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-mist">Spent</p>
                    <p className="text-2xl font-semibold text-ink">{formatNaira(usage.spent_kobo)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-mist">Limit</p>
                    <p className="text-2xl font-semibold text-ink">{formatNaira(usage.limit_kobo)}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper">
                  <div
                    className={`h-full rounded-full ${usage.is_over_budget ? "bg-coral-warn" : "bg-sky"}`}
                    style={{ width: `${Math.min(usage.usage_percent, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-mist">
                  {usage.usage_percent.toFixed(0)}% used · {formatNaira(usage.remaining_kobo)} remaining
                </p>
              </CardBody>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={checkAlerts}>Check alerts</Button>
            <Button variant="ghost" href="/app/budgets">Back to budgets</Button>
          </div>

          {alerts.length > 0 ? (
            <Card>
              <CardBody>
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="size-4 text-sky" />
                  <h2 className="text-sm font-semibold text-ink">Alert history</h2>
                  <span className="text-xs text-mist">({alerts.length})</span>
                </div>
                <div className="space-y-2.5">
                  {alerts.map((a, i) => {
                    const message = typeof a.message === "string" ? a.message : (typeof a.detail === "string" ? a.detail : null);
                    const severity = typeof a.severity === "string" ? a.severity.toLowerCase() : "info";
                    const category = typeof a.category === "string" ? a.category : null;
                    const dateStr = typeof a.created_at === "string" ? a.created_at : (typeof a.timestamp === "string" ? a.timestamp : null);

                    const isWarning = severity === "warning" || severity === "critical";

                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-xs transition-colors ${
                          isWarning
                            ? "border-coral-warn/25 bg-coral-warn/5 text-ink"
                            : "border-line/70 bg-paper/40 text-ink"
                        }`}
                      >
                        {isWarning ? (
                          <AlertTriangle className="size-4 shrink-0 text-coral-warn mt-0.5" />
                        ) : (
                          <Info className="size-4 shrink-0 text-sky mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-ink">
                              {message ?? `Budget alert #${i + 1}`}
                            </p>
                            {severity ? (
                              <Badge
                                variant={isWarning ? "warn" : "sky"}
                                className="text-[10px] uppercase font-semibold px-1.5 py-0.5"
                              >
                                {severity}
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-mist flex-wrap">
                            {category ? <span>Category: {category}</span> : null}
                            {dateStr ? <span>{formatDate(dateStr)}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          ) : null}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
