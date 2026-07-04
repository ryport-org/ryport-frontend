"use client";

import { useEffect, useState } from "react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { aiApi } from "@/lib/api";
import type { BudgetRecommendation } from "@/lib/api/types";
import { AiUpgradeLink } from "@/components/ai/ai-upgrade-link";
import { getAiErrorMessage, isFeatureNotAvailable } from "@/lib/ai/errors";
import { formatNaira } from "@/lib/format";

export default function SmartBudgetsPage() {
  const [recs, setRecs] = useState<BudgetRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    aiApi
      .budgetRecommendations()
      .then(setRecs)
      .catch((err) => {
        setError(err);
        setRecs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function applyAll() {
    setApplying(true);
    setError(null);
    setSuccess("");
    try {
      const created = await aiApi.applyBudgetRecommendations();
      setSuccess(`Created ${created.length} budget${created.length === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(err);
    } finally {
      setApplying(false);
    }
  }

  return (
    <AppPage>
      <AppHeader
        title="Smart budgets"
        description="AI-recommended limits based on your spending"
        action={
          recs.length > 0 ? (
            <Button onClick={() => void applyAll()} disabled={applying}>
              {applying ? "Applying…" : "Apply all"}
            </Button>
          ) : undefined
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
            ) : recs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-sm text-mist">
                  No recommendations yet. Link accounts and add transactions first.
                </p>
              </Card>
            ) : (
              <>
                {success ? (
                  <p className="mb-4 text-sm font-medium text-ink">{success}</p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  {recs.map((r) => (
                    <Card key={r.db_category}>
                      <CardBody>
                        <p className="text-sm font-semibold text-ink">{r.category}</p>
                        <p className="mt-1 text-lg font-semibold text-ink">
                          {formatNaira(r.recommended_limit)}
                        </p>
                        <p className="mt-1 text-xs text-mist">
                          Avg spend: {formatNaira(r.avg_spend)}
                        </p>
                        <p className="mt-2 text-sm text-mist">{r.reasoning}</p>
                        <p className="mt-2 text-xs text-mist">
                          Confidence: {Math.round(r.confidence * 100)}%
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </PlanGate>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
