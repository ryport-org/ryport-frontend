"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { aiApi } from "@/lib/api";
import type { BudgetRecommendation } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export default function SmartBudgetsPage() {
  const [recs, setRecs] = useState<BudgetRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    aiApi.budgetRecommendations(token)
      .then(setRecs)
      .finally(() => setLoading(false));
  }, []);

  async function applyAll() {
    const token = getAccessToken();
    if (!token) return;
    setApplying(true);
    try {
      await aiApi.applyBudgetRecommendations(token);
    } finally {
      setApplying(false);
    }
  }

  return (
    <>
      <AppHeader
        title="Smart budgets"
        description="AI-recommended limits based on your spending"
        action={
          recs.length > 0 ? (
            <Button onClick={applyAll} disabled={applying}>
              {applying ? "Applying…" : "Apply all"}
            </Button>
          ) : undefined
        }
      />
      <div className="p-6 sm:p-8">
        <PlanGate feature="cash_flow_prediction">
          {loading ? (
            <Skeleton className="h-48" />
          ) : recs.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-sm text-mist">No recommendations yet. Link accounts and add transactions first.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {recs.map((r) => (
                <Card key={r.db_category}>
                  <CardBody>
                    <p className="text-sm font-semibold text-ink">{r.category}</p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {formatNaira(r.recommended_limit * 100)}
                    </p>
                    <p className="mt-2 text-sm text-mist">{r.reasoning}</p>
                    <p className="mt-2 text-xs text-mist">
                      Confidence: {Math.round(r.confidence * 100)}%
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </PlanGate>
      </div>
    </>
  );
}
