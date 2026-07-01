"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { aiApi } from "@/lib/api";
import type { CashFlowPrediction } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export default function CashFlowPage() {
  const [data, setData] = useState<CashFlowPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    aiApi.cashFlowPredict(token, 30)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AppHeader title="Cash flow forecast" description="30-day balance projection" />
      <div className="p-6 sm:p-8">
        <PlanGate feature="cash_flow_prediction">
          {loading ? (
            <Skeleton className="h-64" />
          ) : data ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardBody>
                  <p className="text-xs text-mist">Current balance</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {formatNaira(data.current_balance ?? 0)}
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-mist">Days until low</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {data.days_until_low ?? "—"}
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-mist">Monthly burn</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {formatNaira(data.burn_rate_monthly ?? 0)}
                  </p>
                </CardBody>
              </Card>
              {data.ai_insight ? (
                <Card className="sm:col-span-2 lg:col-span-3">
                  <CardBody>
                    <p className="text-sm leading-relaxed text-ink">{data.ai_insight}</p>
                  </CardBody>
                </Card>
              ) : null}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-sm text-mist">No cash flow data available yet.</p>
            </Card>
          )}
        </PlanGate>
      </div>
    </>
  );
}
