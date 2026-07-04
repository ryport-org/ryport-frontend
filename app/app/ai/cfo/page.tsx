"use client";

import { useCallback, useEffect, useState } from "react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { aiApi } from "@/lib/api";
import type { CfoAnalysis } from "@/lib/api/types";
import { AiUpgradeLink } from "@/components/ai/ai-upgrade-link";
import { getAiErrorMessage, isFeatureNotAvailable } from "@/lib/ai/errors";
import { formatNaira } from "@/lib/format";

function runwayMonths(data: CfoAnalysis): number | undefined {
  return data.runway?.months ?? data.runway_months;
}

function summaryText(data: CfoAnalysis): string | undefined {
  return data.executive_summary ?? data.summary;
}

function riskItems(data: CfoAnalysis) {
  return data.risks ?? data.risk_flags ?? [];
}

export default function CfoPage() {
  const [data, setData] = useState<CfoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await aiApi.cfoAnalyse());
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runAnalysis();
  }, [runAnalysis]);

  const runway = data ? runwayMonths(data) : undefined;
  const monthlyBurn =
    data?.burn_rate?.monthly ?? data?.burn_rate_kobo_per_month ?? 0;

  return (
    <AppPage>
      <AppHeader
        title="AI CFO"
        description="Executive financial health analysis"
        action={
          <Button variant="secondary" onClick={() => void runAnalysis()} disabled={loading}>
            {loading ? "Analysing…" : "Refresh"}
          </Button>
        }
      />

      <AppPageBody>
        <AppPageContent>
          <PlanGate feature="ai_cfo">
            {loading && !data ? (
              <Skeleton className="h-64" />
            ) : error ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-coral-warn">{getAiErrorMessage(error)}</p>
                {isFeatureNotAvailable(error) ? (
                  <p className="mt-3">
                    <AiUpgradeLink error={error} />
                  </p>
                ) : (
                  <Button className="mt-4" onClick={() => void runAnalysis()}>
                    Try again
                  </Button>
                )}
              </Card>
            ) : data ? (
              <>
                {data.cached ? (
                  <p className="text-xs text-mist">Cached analysis (updated within 24h)</p>
                ) : null}
                {data.business ? (
                  <p className="text-sm text-mist">
                    {data.business}
                    {data.period_days ? ` · last ${data.period_days} days` : ""}
                  </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardBody>
                      <p className="text-xs text-mist">Health score</p>
                      <p className="mt-2 text-3xl font-semibold text-ink">
                        {data.health_score ?? "—"}
                      </p>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <p className="text-xs text-mist">Runway</p>
                      <p className="mt-2 text-3xl font-semibold text-ink">
                        {runway != null ? `${runway} mo` : "—"}
                      </p>
                      {data.runway_notes ? (
                        <p className="mt-1 text-xs text-mist">{data.runway_notes}</p>
                      ) : null}
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <p className="text-xs text-mist">Monthly burn</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">
                        {monthlyBurn ? formatNaira(monthlyBurn) : "—"}
                      </p>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <p className="text-xs text-mist">Risk level</p>
                      <p className="mt-2 text-lg font-semibold capitalize text-ink">
                        {data.runway?.risk_level ?? "—"}
                      </p>
                    </CardBody>
                  </Card>
                </div>
                {summaryText(data) ? (
                  <Card>
                    <CardBody>
                      <h2 className="text-sm font-semibold text-ink">Summary</h2>
                      <p className="mt-3 text-sm leading-relaxed text-mist">{summaryText(data)}</p>
                    </CardBody>
                  </Card>
                ) : null}
                {riskItems(data).length > 0 ? (
                  <Card>
                    <CardBody>
                      <h2 className="text-sm font-semibold text-ink">Risks</h2>
                      <ul className="mt-3 space-y-2">
                        {riskItems(data).map((r, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="font-medium capitalize text-coral-warn">
                              {r.severity}
                            </span>
                            <span className="text-mist">{r.description}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                ) : null}
              </>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-sm text-mist">Run analysis to see your CFO dashboard.</p>
                <Button className="mt-4" onClick={() => void runAnalysis()}>
                  Run analysis
                </Button>
              </Card>
            )}
          </PlanGate>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
