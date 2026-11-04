"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  Sparkles,
  TrendingUp,
  CreditCard,
  Target,
  FileText,
  PieChart,
  MessageSquareText,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { MoneyWaitingWidget } from "@/components/dashboard/money-waiting-widget";
import { getAccessToken } from "@/lib/auth/tokens";
import { dashboardApi } from "@/lib/api";
import type { DashboardOverview } from "@/lib/api/dashboard";
import type { PersonalDashboardData, Plan } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSwrData } from "@/lib/hooks/use-swr-data";
import { swrCache } from "@/lib/cache/swr-cache";

interface PersonalDashboardProps {
  planTier?: Plan | null;
}

const createDefaultPersonalData = (): PersonalDashboardData => ({
  balance_summary: {
    total_balance_kobo: 0,
    account_count: 0,
    linked_accounts_count: 0,
    currency: "NGN",
  },
  spend_by_category: [],
  budget_alerts: [],
  goal_progress: null,
  ai_quota: null,
  recent_transactions: [],
  pro_features: null,
  business_personal_split: null,
  cash_flow_forecast: null,
  open_invoices_summary: null,
  receivables_summary: null,
});

function overviewToPersonalData(overview: DashboardOverview): PersonalDashboardData {
  return {
    balance_summary: {
      total_balance_kobo: overview.net_position_kobo ?? 0,
      account_count: overview.linked_accounts_count ?? 0,
      linked_accounts_count: overview.linked_accounts_count ?? 0,
      currency: "NGN",
    },
    spend_by_category: [],
    budget_alerts: (overview.budgets ?? []).map((b) => ({
      id: b.id,
      budget_id: b.id,
      message: `${b.category} budget limit`,
      category: b.category,
      usage_percent: b.usage?.usage_percent ?? 0,
      spent_kobo: b.usage?.spent_kobo ?? 0,
      limit_kobo: b.usage?.limit_kobo ?? 0,
    })),
    goal_progress: null,
    ai_quota: overview.ai_quota ?? null,
    recent_transactions: overview.recent_transactions ?? [],
    pro_features: null,
    business_personal_split: null,
    cash_flow_forecast: null,
    open_invoices_summary: null,
    receivables_summary: null,
  };
}

export function PersonalDashboard({ planTier }: PersonalDashboardProps) {
  const fetchDashboard = useCallback(async (): Promise<PersonalDashboardData> => {
    const token = getAccessToken();
    try {
      return await dashboardApi.personal(token);
    } catch (err) {
      // Resilience Level 1: Attempt fallback to /dashboard/overview/
      try {
        const currentToken = getAccessToken();
        const overview = await dashboardApi.overview(currentToken);
        return overviewToPersonalData(overview);
      } catch {
        // Resilience Level 2: Fallback to cached entry or clean initial data
        const cached = swrCache.get<PersonalDashboardData>("dashboard_personal");
        if (cached?.data) {
          return cached.data;
        }
        return createDefaultPersonalData();
      }
    }
  }, []);

  const {
    data,
    isLoading,
    isValidating,
    error,
    reload,
  } = useSwrData<PersonalDashboardData>("dashboard_personal", fetchDashboard, {
    ttlMs: 3 * 60 * 1000, // 3 minutes freshness
  });

  // Only show full skeleton if there is NO cached data and initial request is loading
  if (isLoading && !data) {
    return <PersonalDashboardSkeleton />;
  }

  const activeData = data ?? createDefaultPersonalData();
  const isProOrAdvanced = planTier === "pro" || planTier === "advanced";

  return (
    <div className="space-y-6">
      {/* Background Revalidation or Stale Cache Warning Banner */}
      {error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <span>
              Could not reach the server to refresh your latest numbers. Showing your saved dashboard details.
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void reload()}
            className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 min-h-8 px-3 py-1.5 text-xs"
          >
            <RefreshCw className={cn("size-3.5", isValidating && "animate-spin")} />
            {isValidating ? "Syncing…" : "Retry"}
          </Button>
        </div>
      ) : null}
      {/* 1. Balance Summary, AI Quota & Spending Overview (Perfectly Aligned 3-Column Top Grid) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        <BalanceSummaryCard
          totalBalanceKobo={activeData.balance_summary?.total_balance_kobo ?? 0}
          linkedAccountsCount={activeData.balance_summary?.linked_accounts_count ?? 0}
        />
        <AiQuotaBadgeCard quota={activeData.ai_quota} />
        {isProOrAdvanced && activeData.cash_flow_forecast ? (
          <CashFlowForecastCard forecast={activeData.cash_flow_forecast} />
        ) : (
          <MonthlySpendSummaryCard categories={activeData.spend_by_category ?? []} />
        )}
      </div>

      {/* Money Waiting to Be Collected Widget */}
      <MoneyWaitingWidget
        initialSummary={activeData.pro_features?.receivables_summary ?? activeData.receivables_summary}
      />

      {/* Conditional Cards for Pro / Advanced Tiers */}
      {isProOrAdvanced && (activeData.business_personal_split || activeData.open_invoices_summary) ? (
        <div className="grid gap-4 sm:grid-cols-2 items-stretch">
          {activeData.business_personal_split ? (
            <BusinessPersonalSplitCard split={activeData.business_personal_split} />
          ) : null}
          {activeData.open_invoices_summary ? (
            <OpenInvoicesSummaryCard summary={activeData.open_invoices_summary} />
          ) : null}
        </div>
      ) : null}

      {/* 2. Main Analytics & Lists Grid (Left & Right Columns End on Same Straight Line) */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {/* Left Column: Spend Category Chart & Recent Transactions */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-2">
          <SpendByCategoryCard categories={activeData.spend_by_category ?? []} />
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
              <TransactionList transactions={(activeData.recent_transactions ?? []).slice(0, 6)} />
            </div>
          </Card>
        </div>

        {/* Right Column: Budget Alerts & Goal Progress */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-1">
          <BudgetAlertsCard alerts={activeData.budget_alerts ?? []} />
          <GoalProgressCard goal={activeData.goal_progress} className="flex-1" />
        </div>
      </div>
    </div>
  );
}

export default PersonalDashboard;

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
            {alerts.map((alert, idx) => {
              const alertKey = alert.id || (alert as unknown as { budget_id?: string }).budget_id || String(idx);
              const message =
                alert.message ||
                `${alert.category || "Category"} budget is ${
                  (alert as unknown as { usage_percent?: number }).usage_percent ?? 80
                }% used`;
              return (
                <div
                  key={alertKey}
                  className="flex items-start gap-2.5 rounded-lg border border-coral-warn/20 bg-coral-warn/5 p-3 text-xs"
                >
                  <AlertTriangle className="size-4 shrink-0 text-coral-warn mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-ink">{message}</p>
                    {alert.category ? (
                      <span className="text-[11px] text-mist">Category: {alert.category}</span>
                    ) : null}
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

function GoalProgressCard({
  goal,
  className,
}: {
  goal: PersonalDashboardData["goal_progress"];
  className?: string;
}) {
  const goalObj = goal as unknown as {
    percentage?: number;
    progress_percent?: number;
    current_kobo?: number;
    current_amount_kobo?: number;
    target_kobo?: number;
    target_amount_kobo?: number;
  } | null;

  const percentage = goalObj?.percentage ?? goalObj?.progress_percent ?? 0;
  const currentKobo = goalObj?.current_kobo ?? goalObj?.current_amount_kobo ?? 0;
  const targetKobo = goalObj?.target_kobo ?? goalObj?.target_amount_kobo ?? 0;

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
              <span className="text-xs font-bold text-sky">{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-sky transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-mist">
              <span>Saved: {formatNaira(currentKobo)}</span>
              <span>Target: {formatNaira(targetKobo)}</span>
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
