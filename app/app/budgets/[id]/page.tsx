"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokens";
import { budgetsApi } from "@/lib/api";
import type { Budget, BudgetUsage } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

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
          <div className="p-6">
            <Skeleton className="h-48" />
          </div>
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
        <div className="space-y-6 p-6 sm:p-8">
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
                <h2 className="text-sm font-semibold text-ink">Alert history</h2>
                <ul className="mt-3 space-y-2 text-sm text-mist">
                  {alerts.map((a, i) => (
                    <li key={i}>{JSON.stringify(a)}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </AppPageBody>
    </AppPage>
  );
}
