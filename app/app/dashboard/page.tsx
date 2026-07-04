"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "@/components/marketing/sparkline";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { AiInsightCard, TransactionList } from "@/components/dashboard/transaction-list";
import { BudgetProgressList } from "@/components/dashboard/budget-progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { dashboardApi } from "@/lib/api";
import type { DashboardOverview } from "@/lib/api/dashboard";
import type { Budget, BudgetUsage, Transaction } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export default function DashboardPage() {
  const { aiQuota: bootstrapQuota, plan } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await dashboardApi.overview(token);
        setOverview(data);
      } catch {
        setError("Could not load your dashboard summary. Please try again.");
        setOverview(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const transactions: Transaction[] = overview?.recent_transactions ?? [];
  const budgets: (Budget & { usage?: BudgetUsage })[] = overview?.budgets ?? [];
  const income = overview?.income_kobo ?? 0;
  const expenses = overview?.expense_kobo ?? 0;
  const netPosition =
    overview?.net_position_kobo ?? transactions.reduce((sum, t) => {
      return sum + (t.type === "income" ? t.amount_kobo : -t.amount_kobo);
    }, 0);
  const linkedAccounts =
    overview?.linked_accounts_count ?? 0;
  const runwayDays = overview?.runway_days ?? overview?.days_until_low ?? null;
  const quota = overview?.ai_quota ?? bootstrapQuota;

  return (
    <AppPage>
      <AppHeader title="Dashboard" description="Your financial overview at a glance" />

      <AppPageBody>
        <AppPageContent>
          {plan?.plan === "free" ? (
            <Card className="border-brand/20 bg-sky-soft/30">
              <CardBody className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink">
                  Unlock unlimited AI, exports, and cash flow forecasts.
                </p>
                <Button href="/app/upgrade" variant="primary">
                  Upgrade
                </Button>
              </CardBody>
            </Card>
          ) : null}

          {error ? (
            <Card className="border-coral-warn/30 bg-coral-warn/5">
              <CardBody className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-coral-warn">{error}</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardBody>
            </Card>
          ) : null}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : error ? null : (
            <>
              <Card className="overflow-hidden">
                <CardBody className="relative">
                  <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
                    <Sparkline />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-wide text-mist">
                      Net position (30d)
                    </p>
                    <p
                      className="mt-2 font-display tabular-nums text-ink"
                      style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", lineHeight: 1 }}
                    >
                      {formatNaira(netPosition)}
                    </p>
                    <p className="mt-2 text-sm text-mist">
                      {linkedAccounts} linked account{linkedAccounts !== 1 ? "s" : ""}
                      {runwayDays != null && runwayDays < 14
                        ? ` · Low balance in ${runwayDays} days`
                        : ""}
                    </p>
                  </div>
                </CardBody>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Income (recent)"
                  value={formatNaira(income)}
                  change={income > 0 ? "↑" : undefined}
                />
                <StatCard
                  label="Expenses (recent)"
                  value={formatNaira(expenses)}
                  changePositive={false}
                />
                <StatCard label="Linked accounts" value={String(linkedAccounts)} />
                <StatCard
                  label="AI messages left"
                  value={
                    quota
                      ? quota.is_unlimited || quota.limit < 0
                        ? "∞"
                        : String(quota.remaining)
                      : "—"
                  }
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <h2 className="text-sm font-semibold text-ink">Recent transactions</h2>
                  </CardHeader>
                  <TransactionList transactions={transactions.slice(0, 8)} />
                </Card>

                <div className="space-y-6">
                  <AiInsightCard insight="Ask Ryport where your money went this month — food, transport, and subscriptions are categorised automatically from your linked accounts." />
                  <Card>
                    <CardHeader>
                      <h2 className="text-sm font-semibold text-ink">Budgets</h2>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <BudgetProgressList budgets={budgets.slice(0, 4)} />
                    </CardBody>
                  </Card>
                </div>
              </div>
            </>
          )}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
