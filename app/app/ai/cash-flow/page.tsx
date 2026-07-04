"use client";

import { useEffect, useState } from "react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { aiApi } from "@/lib/api";
import type { CashFlowPrediction } from "@/lib/api/types";
import { AiUpgradeLink } from "@/components/ai/ai-upgrade-link";
import { getAiErrorMessage, isFeatureNotAvailable } from "@/lib/ai/errors";
import { formatNaira } from "@/lib/format";

function balanceLabel(data: CashFlowPrediction): string {
  if (data.current_balance_naira) return data.current_balance_naira;
  return formatNaira(data.current_balance ?? 0);
}

export default function CashFlowPage() {
  const [data, setData] = useState<CashFlowPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    aiApi
      .cashFlowPredict(30)
      .then(setData)
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const showLowBalanceWarning =
    data?.days_until_low != null && data.days_until_low < 14;

  return (
    <AppPage>
      <AppHeader title="Cash flow forecast" description="30-day balance projection" />

      <AppPageBody>
        <AppPageContent>
          <PlanGate feature="cash_flow_prediction">
            {loading ? (
              <Skeleton className="h-64" />
            ) : error ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-coral-warn">{getAiErrorMessage(error)}</p>
                {isFeatureNotAvailable(error) ? (
                  <p className="mt-3">
                    <AiUpgradeLink error={error} />
                  </p>
                ) : null}
              </Card>
            ) : data ? (
              <div className="space-y-4">
                {showLowBalanceWarning ? (
                  <Card className="border-coral-warn/30 bg-coral-warn/5">
                    <CardBody>
                      <p className="text-sm text-ink">
                        Your balance may run low in{" "}
                        <span className="font-semibold">{data.days_until_low} days</span>
                        {data.low_balance_date ? ` (${data.low_balance_date})` : ""}.
                      </p>
                    </CardBody>
                  </Card>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardBody>
                      <p className="text-xs text-mist">Current balance</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{balanceLabel(data)}</p>
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
                        {formatNaira(data.burn_rate_monthly ?? data.burn_rate_kobo_per_month ?? 0)}
                      </p>
                    </CardBody>
                  </Card>
                </div>
                {data.ai_insight ? (
                  <Card>
                    <CardBody>
                      <p className="text-sm leading-relaxed text-ink">{data.ai_insight}</p>
                    </CardBody>
                  </Card>
                ) : null}
                {data.projections && data.projections.length > 0 ? (
                  <Card>
                    <CardBody>
                      <h2 className="text-sm font-semibold text-ink">30-day projection</h2>
                      <ul className="mt-4 divide-y divide-line">
                        {data.projections.slice(0, 7).map((point) => (
                          <li
                            key={point.date}
                            className="flex items-center justify-between py-2 text-sm"
                          >
                            <span className="text-mist">{point.date}</span>
                            <span className="font-medium tabular-nums text-ink">
                              {point.balance_naira ?? formatNaira(point.projected_balance)}
                            </span>
                          </li>
                        ))}
                      </ul>
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
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
