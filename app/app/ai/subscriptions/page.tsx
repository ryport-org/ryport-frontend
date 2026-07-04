"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { aiApi } from "@/lib/api";
import type { SubscriptionItem } from "@/lib/api/types";
import { AiUpgradeLink } from "@/components/ai/ai-upgrade-link";
import { getAiErrorMessage, isFeatureNotAvailable } from "@/lib/ai/errors";
import { formatNaira } from "@/lib/format";

export default function SubscriptionsPage() {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function load(refresh = false) {
    setError(null);
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setItems(await aiApi.subscriptions(refresh));
    } catch (err) {
      setError(err);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <AppPage>
      <AppHeader
        title="Subscriptions"
        description="Recurring charges detected by AI"
        action={
          <Button
            variant="secondary"
            className="gap-1.5"
            onClick={() => void load(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
        }
      />

      <AppPageBody>
        <AppPageContent>
          <PlanGate feature="cash_flow_prediction">
            {loading ? (
              <Skeleton className="h-48" />
            ) : error ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-coral-warn">{getAiErrorMessage(error)}</p>
                {isFeatureNotAvailable(error) ? (
                  <p className="mt-3">
                    <AiUpgradeLink error={error} />
                  </p>
                ) : null}
              </Card>
            ) : items.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-sm text-mist">No recurring subscriptions detected.</p>
              </Card>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line bg-white">
                {items.map((item) => (
                  <li key={`${item.merchant}-${item.last_charged ?? item.frequency}`} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{item.merchant}</p>
                        <p className="mt-0.5 text-xs capitalize text-mist">
                          {item.frequency}
                          {item.last_charged ? ` · last ${item.last_charged}` : ""}
                          {item.times_charged ? ` · ${item.times_charged} charges` : ""}
                        </p>
                        {item.is_duplicate ? (
                          <p className="mt-1 text-xs font-medium text-coral-warn">Possible duplicate</p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-ink">
                          {item.amount_monthly_naira ?? formatNaira(item.amount_monthly_kobo)}/mo
                        </p>
                        {item.amount_annual_naira ? (
                          <p className="mt-0.5 text-xs text-mist">{item.amount_annual_naira}/yr</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </PlanGate>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
