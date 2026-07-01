"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { aiApi } from "@/lib/api";
import type { CfoAnalysis } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export default function CfoPage() {
  const [data, setData] = useState<CfoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      setData(await aiApi.cfoAnalyse(token));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <>
      <AppHeader
        title="AI CFO"
        description="Executive financial health analysis"
        action={
          <Button variant="secondary" onClick={runAnalysis} disabled={loading}>
            {loading ? "Analysing…" : "Refresh"}
          </Button>
        }
      />
      <div className="space-y-6 p-6 sm:p-8">
        <PlanGate feature="ai_cfo">
          {loading && !data ? (
            <Skeleton className="h-64" />
          ) : data ? (
            <>
              {data.cached ? (
                <p className="text-xs text-mist">Cached analysis (updated within 24h)</p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardBody>
                    <p className="text-xs text-mist">Health score</p>
                    <p className="mt-2 text-3xl font-semibold text-ink">{data.health_score ?? "—"}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-xs text-mist">Runway</p>
                    <p className="mt-2 text-3xl font-semibold text-ink">
                      {data.runway?.months ?? "—"} mo
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-xs text-mist">Monthly burn</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {formatNaira(data.burn_rate?.monthly ?? 0)}
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
              {data.executive_summary ? (
                <Card>
                  <CardBody>
                    <h2 className="text-sm font-semibold text-ink">Executive summary</h2>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{data.executive_summary}</p>
                  </CardBody>
                </Card>
              ) : null}
              {data.risks && data.risks.length > 0 ? (
                <Card>
                  <CardBody>
                    <h2 className="text-sm font-semibold text-ink">Risks</h2>
                    <ul className="mt-3 space-y-2">
                      {data.risks.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="font-medium capitalize text-coral-warn">{r.severity}</span>
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
              <Button className="mt-4" onClick={runAnalysis}>Run analysis</Button>
            </Card>
          )}
        </PlanGate>
      </div>
    </>
  );
}
