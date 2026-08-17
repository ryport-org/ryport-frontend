"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  CreditCard,
  Target,
  FileText,
  PieChart,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { getAccessToken } from "@/lib/auth/tokens";
import { dashboardApi } from "@/lib/api";
import type { PersonalDashboardData, Plan } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PersonalDashboardProps {
  planTier?: Plan | null;
}

export function PersonalDashboard({ planTier }: PersonalDashboardProps) {
  const [data, setData] = useState<PersonalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.personal(token);
      setData(res);
    } catch {
      setError("Could not load your personal dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  if (loading) {
    return <PersonalDashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="border-coral-warn/30 bg-coral-warn/5">
        <CardBody className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-coral-warn">{error ?? "Failed to load dashboard."}</p>
          <Button type="button" variant="secondary" onClick={() => void fetchData()}>
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  const isProOrAdvanced = planTier === "pro" || planTier === "advanced";

  return (
    <div className="space-y-6">
      {/* 1. Balance Summary, AI Quota & Spending Overview (Perfectly Aligned 3-Column Top Grid) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        <BalanceSummaryCard
          totalBalanceKobo={data.balance_summary?.total_balance_kobo ?? 0}
          linkedAccountsCount={data.balance_summary?.linked_accounts_count ?? 0}
        />
        <AiQuotaBadgeCard quota={data.ai_quota} />
        {isProOrAdvanced && data.cash_flow_forecast ? (
          <CashFlowForecastCard forecast={data.cash_flow_forecast} />
        ) : (
          <MonthlySpendSummaryCard categories={data.spend_by_category ?? []} />
        )}
      </div>

      {/* Conditional Cards for Pro / Advanced Tiers */}
      {isProOrAdvanced && (data.business_personal_split || data.open_invoices_summary) ? (
        <div className="grid gap-4 sm:grid-cols-2 items-stretch">
          {data.business_personal_split ? (
            <BusinessPersonalSplitCard split={data.business_personal_split} />
          ) : null}
          {data.open_invoices_summary ? (
            <OpenInvoicesSummaryCard summary={data.open_invoices_summary} />
          ) : null}
        </div>
      ) : null}

      {/* 2. Main Analytics & Lists Grid (Left & Right Columns End on Same Straight Line) */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {/* Left Column: Spend Category Chart & Recent Transactions */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-2">
          <SpendByCategoryCard categories={data.spend_by_category ?? []} />
          <Card className="overflow-hidden flex flex-col flex-1">
            <CardHeader className="flex flex-row items-center justify-between border-b border-line/60 bg-paper/30 py-3.5">
              <h2 className="text-sm font-semibold text-ink">Recent transactions</h2>
              <Link
                href="/app/transactions"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky hover:text-sky/80"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <div className="flex-1 flex flex-col justify-between">
              <TransactionList transactions={(data.recent_transactions ?? []).slice(0, 6)} />
            </div>
          </Card>
        </div>

        {/* Right Column: Budget Alerts & Goal Progress */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-1">
          <BudgetAlertsCard alerts={data.budget_alerts ?? []} />
          <GoalProgressCard goal={data.goal_progress} className="flex-1" />
        </div>
      </div>
    </div>
  );
}

/* --- Section Components --- */

function BalanceSummaryCard({
  totalBalanceKobo,
  linkedAccountsCount,
}: {
  totalBalanceKobo: number;
  linkedAccountsCount: number;
}) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardBody className="flex flex-col justify-between flex-1 p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist">
              Total Net Balance
            </span>
            <CreditCard className="size-4 text-mist" />
          </div>
          <p
            className="my-3 font-display tabular-nums text-ink"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)", lineHeight: 1 }}
          >
            {formatNaira(totalBalanceKobo)}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-line/40">
          <p className="text-xs text-mist">
            {linkedAccountsCount} linked account{linkedAccountsCount !== 1 ? "s" : ""}
          </p>
          <Link
            href="/app/accounts"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky hover:underline"
          >
            Manage <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

function AiQuotaBadgeCard({ quota }: { quota: PersonalDashboardData["ai_quota"] }) {
  const remaining = quota?.remaining ?? 0;
  const isUnlimited = quota?.is_unlimited || (quota?.limit ?? 0) < 0;

  return (
    <Card className="border-sky/20 bg-sky-soft/20 flex flex-col h-full">
      <CardBody className="flex flex-col justify-between flex-1 p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-sky text-white">
                <Sparkles className="size-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky">
                AI CFO Assistant
              </span>
            </div>
            <span className="rounded-full bg-sky/10 px-2.5 py-0.5 text-xs font-bold text-sky">
              {isUnlimited ? "Unlimited" : `${remaining} left`}
            </span>
          </div>
          <p className="my-3 text-xs text-mist leading-relaxed">
            Ask intelligent questions about your spending, budget alerts & financial insights.
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-sky/10">
          <span className="text-[11px] text-mist">Powered by Ryport AI</span>
          <Button href="/app/ai/chat" variant="primary" className="text-xs py-1.5 px-3">
            Open Chat
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function CashFlowForecastCard({
  forecast,
}: {
  forecast: NonNullable<PersonalDashboardData["cash_flow_forecast"]>;
}) {
  return (
    <Card className="border-brand/20 bg-brand/5 flex flex-col h-full">
      <CardBody className="flex flex-col justify-between flex-1 p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist">
              30-Day Cash Flow Forecast
            </span>
            <TrendingUp className="size-4 text-brand" />
          </div>
          <p
            className="my-3 font-display tabular-nums text-ink"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)", lineHeight: 1 }}
          >
            {formatNaira(forecast.projected_30d_kobo)}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-brand/10">
          <span className="text-xs text-mist">Trend: {forecast.trend}</span>
          <Link
            href="/app/ai/cash-flow"
            className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1"
          >
            Details <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

function MonthlySpendSummaryCard({
  categories,
}: {
  categories: PersonalDashboardData["spend_by_category"];
}) {
  const totalKobo = categories.reduce((sum, c) => sum + c.amount_kobo, 0);

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardBody className="flex flex-col justify-between flex-1 p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist">
              Monthly Spending
            </span>
            <TrendingUp className="size-4 text-sky" />
          </div>
          <p
            className="my-3 font-display tabular-nums text-ink"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)", lineHeight: 1 }}
          >
            {formatNaira(totalKobo)}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-line/40">
          <p className="text-xs text-mist">
            Across {categories.length} category slot{categories.length !== 1 ? "s" : ""}
          </p>
          <Link
            href="/app/transactions"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky hover:underline"
          >
            Details <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

function SpendByCategoryCard({
  categories,
}: {
  categories: PersonalDashboardData["spend_by_category"];
}) {
  const maxKobo = Math.max(...categories.map((c) => c.amount_kobo), 1);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="size-4 text-sky" />
          <h2 className="text-sm font-semibold text-ink">Spend by Category (This Month)</h2>
        </div>
      </CardHeader>
      <CardBody className="pt-0 flex-1 flex flex-col justify-center">
        {categories.length === 0 ? (
          <p className="py-6 text-center text-xs text-mist">No spending recorded this month.</p>
        ) : (
          <div className="space-y-3 flex-1">
            {categories.map((cat) => {
              const widthPct = Math.min(Math.round((cat.amount_kobo / maxKobo) * 100), 100);
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-ink">{cat.category}</span>
                    <span className="tabular-nums text-mist">
                      {formatNaira(cat.amount_kobo)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-sky transition-all duration-300"
                      style={{ width: `${Math.max(widthPct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function BudgetAlertsCard({ alerts }: { alerts: PersonalDashboardData["budget_alerts"] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <h2 className="text-sm font-semibold text-ink">Budget Alerts</h2>
      </CardHeader>
      <CardBody className="pt-0 flex-1 flex flex-col justify-center">
        {alerts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-line p-6 text-center">
            <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
            <p className="text-xs font-semibold text-ink">No alerts — you&apos;re on track</p>
            <p className="mt-1 text-[11px] text-mist">Your category spending is within set budget limits.</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-2.5 rounded-lg border border-coral-warn/20 bg-coral-warn/5 p-3 text-xs"
              >
                <AlertTriangle className="size-4 shrink-0 text-coral-warn mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-ink">{alert.message}</p>
                  {alert.category ? (
                    <span className="text-[11px] text-mist">Category: {alert.category}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function GoalProgressCard({
  goal,
  className,
}: {
  goal: PersonalDashboardData["goal_progress"];
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-sky" />
          <h2 className="text-sm font-semibold text-ink">Savings Goal</h2>
        </div>
      </CardHeader>
      <CardBody className="pt-0 flex-1 flex flex-col justify-between">
        {!goal ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-line p-6 text-center">
            <Target className="size-8 text-mist mb-2" />
            <p className="text-xs font-semibold text-ink">Set your first goal</p>
            <p className="mt-1 text-[11px] text-mist mb-3">Track progress towards key financial targets.</p>
            <Button href="/app/budgets" variant="secondary" className="text-xs py-1.5 px-3">
              Set a Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ink">{goal.title}</h3>
              <span className="text-xs font-bold text-sky">{goal.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-sky transition-all duration-300"
                style={{ width: `${Math.min(goal.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-mist">
              <span>Saved: {formatNaira(goal.current_kobo)}</span>
              <span>Target: {formatNaira(goal.target_kobo)}</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function BusinessPersonalSplitCard({
  split,
}: {
  split: NonNullable<PersonalDashboardData["business_personal_split"]>;
}) {
  const total = (split.personal_kobo + split.business_kobo) || 1;
  const personalPct = Math.round((split.personal_kobo / total) * 100);
  const businessPct = 100 - personalPct;

  return (
    <Card className="flex flex-col h-full">
      <CardBody className="p-4 flex-1 flex flex-col justify-between">
        <span className="text-xs font-semibold text-ink">Business vs Personal Split</span>
        <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-line">
          <div className="bg-sky transition-all" style={{ width: `${personalPct}%` }} />
          <div className="bg-brand transition-all" style={{ width: `${businessPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-mist">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-sky" /> Personal ({personalPct}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-brand" /> Business ({businessPct}%)
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

function OpenInvoicesSummaryCard({
  summary,
}: {
  summary: NonNullable<PersonalDashboardData["open_invoices_summary"]>;
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardBody className="flex items-center justify-between p-4 flex-1">
        <div>
          <span className="text-xs font-semibold text-ink">Open Invoices</span>
          <p className="mt-1 font-display text-lg text-ink">
            {formatNaira(summary.total_kobo)} ({summary.count})
          </p>
        </div>
        <FileText className="size-5 text-mist" />
      </CardBody>
    </Card>
  );
}

function PersonalDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
