"use client";

import { useEffect, useState } from "react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { aiApi } from "@/lib/api";
import type { SubscriptionItem } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export default function SubscriptionsPage() {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    aiApi.subscriptions(token)
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppPage>
      <AppHeader title="Subscriptions" description="Recurring charges detected by AI" />

      <AppPageBody>
      <div className="p-6 sm:p-8">
        <PlanGate feature="cash_flow_prediction">
          {loading ? (
            <Skeleton className="h-48" />
          ) : items.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-sm text-mist">No recurring subscriptions detected.</p>
            </Card>
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line bg-white">
              {items.map((item, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.merchant}</p>
                    <p className="text-xs text-mist">{item.frequency}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    {formatNaira(item.amount_monthly_kobo)}/mo
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PlanGate>
      </div>
          </AppPageBody>
    </AppPage>  );
}
