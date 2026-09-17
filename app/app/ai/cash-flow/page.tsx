"use client";

import { useEffect, useState } from "react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi, aiApi } from "@/lib/api";
import type { CashFlowDashboardData, CashFlowPrediction } from "@/lib/api/types";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { getAccessToken } from "@/lib/auth/tokens";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function CashFlowPage() {
  const [chartData, setChartData] = useState<CashFlowDashboardData | null>(null);
  const [aiPrediction, setAiPrediction] = useState<CashFlowPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    Promise.allSettled([
      dashboardApi.cashFlow(token),
      aiApi.cashFlowPredict(30, token),
    ])
      .then(([flowRes, predictRes]) => {
        if (flowRes.status === "fulfilled") {
          setChartData(flowRes.value);
        } else {
          setError(getAuthErrorMessage(flowRes.reason));
        }

        if (predictRes.status === "fulfilled") {
          setAiPrediction(predictRes.value);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppPage>
      <AppHeader
        title="Cash Flow & Liquidity"
        description="90-day trailing cash flow velocity, inflows, outflows, and predictive balance modeling."
      />

      <AppPageBody>
        <AppPageContent>
          <PlanGate feature="cash_flow_prediction">
            {loading ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                </div>
                <Skeleton className="h-80 rounded-xl" />
              </div>
            ) : error && !chartData ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-coral-warn">{error}</p>
              </Card>
            ) : chartData ? (
              <div className="space-y-6">
                <CashFlowChart data={chartData} />

                {aiPrediction?.ai_insight && (
                  <Card className="border-sky/20 bg-sky-soft/20 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-sky mb-2">
                      AI Liquidity Insight
                    </h3>
                    <p className="text-sm leading-relaxed text-ink">
                      {aiPrediction.ai_insight}
                    </p>
                  </Card>
                )}
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
