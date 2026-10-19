"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  FileBarChart,
  FileText,
  PieChart,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { reportsApi } from "@/lib/api";
import type { Report } from "@/lib/api/types";
import { formatDate, formatNaira } from "@/lib/format";

interface CategoryBreakdownItem {
  category: string;
  amount_kobo: number;
  percentage?: number;
  transaction_count?: number;
}

interface ReportPayload {
  period?: string;
  period_start?: string;
  period_end?: string;
  total_income_kobo?: number;
  revenue_kobo?: number;
  total_expense_kobo?: number;
  expenses_kobo?: number;
  net_kobo?: number;
  net_profit_kobo?: number;
  transaction_count?: number;
  by_category?: CategoryBreakdownItem[];
  breakdown_by_category?: CategoryBreakdownItem[];
  ai_suggestions?: string[];
  ai_insights?: string[];
  [key: string]: unknown;
}

function formatPeriodLabel(period?: string): string {
  if (!period) return "Report Period";
  // Handle 2026-W43 -> Week 43, 2026
  const weekMatch = period.match(/^(\d{4})-W(\d{1,2})$/i);
  if (weekMatch) {
    return `Week ${weekMatch[2]}, ${weekMatch[1]}`;
  }
  // Handle 2026-10 -> October 2026
  const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const date = new Date(parseInt(monthMatch[1], 10), parseInt(monthMatch[2], 10) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return period;
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canUse } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    reportsApi.get(token, id).then(setReport).finally(() => setLoading(false));
  }, [id]);

  async function handleExport(format: "pdf" | "csv" | "xlsx") {
    const token = getAccessToken();
    if (!token || !id) return;
    setExporting(format);
    try {
      const { blob, filename } = await reportsApi.export(token, id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  if (loading) {
    return (
      <AppPage>
        <AppHeader title="Financial Report" description="Loading report insights..." />
        <AppPageBody>
          <AppPageContent className="space-y-6">
            <Skeleton className="h-32 rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </AppPageContent>
        </AppPageBody>
      </AppPage>
    );
  }

  // Extract structured report payload
  const rawData: ReportPayload = (report?.data ?? report?.summary ?? {}) as ReportPayload;

  const periodLabel = formatPeriodLabel(rawData.period ?? report?.period);
  const periodStart = rawData.period_start ? formatDate(rawData.period_start) : null;
  const periodEnd = rawData.period_end ? formatDate(rawData.period_end) : null;

  const totalIncomeKobo = rawData.total_income_kobo ?? rawData.revenue_kobo ?? 0;
  const totalExpenseKobo = rawData.total_expense_kobo ?? rawData.expenses_kobo ?? 0;
  const netKobo = rawData.net_kobo ?? rawData.net_profit_kobo ?? (totalIncomeKobo - totalExpenseKobo);
  const txCount = rawData.transaction_count ?? 0;

  const categories: CategoryBreakdownItem[] = rawData.by_category ?? rawData.breakdown_by_category ?? [];
  const maxCategoryKobo = Math.max(...categories.map((c) => c.amount_kobo), 1);

  const suggestions: string[] = rawData.ai_suggestions ?? rawData.ai_insights ?? [];

  const isNetPositive = netKobo >= 0;

  return (
    <AppPage>
      <AppHeader
        title={report?.title ?? `${periodLabel} Report`}
        description={
          periodStart && periodEnd
            ? `${periodStart} — ${periodEnd}`
            : report?.created_at
              ? `Generated on ${formatDate(report.created_at)}`
              : "Financial snapshot and summary"
        }
        action={
          canUse("export_reports") ? (
            <div className="flex flex-wrap items-center gap-2">
              {(["pdf", "csv", "xlsx"] as const).map((f) => (
                <Button
                  key={f}
                  variant="secondary"
                  className="gap-1.5 uppercase text-xs"
                  disabled={exporting === f}
                  onClick={() => handleExport(f)}
                >
                  <Download className="size-3.5" />
                  {f}
                </Button>
              ))}
            </div>
          ) : undefined
        }
      />

      <AppPageBody>
        <AppPageContent className="space-y-6">
          {/* Back link and Report Meta pill */}
          <div className="flex items-center justify-between">
            <Link
              href="/app/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"
            >
              <ArrowLeft className="size-3.5" /> Back to all reports
            </Link>

            <div className="flex items-center gap-2">
              <Badge variant="sky" className="uppercase tracking-wide">
                {report?.type ?? "Weekly"}
              </Badge>
              {rawData.period ? (
                <span className="font-mono text-xs text-mist">{rawData.period}</span>
              ) : null}
            </div>
          </div>

          {/* 1. Executive Key Performance Indicator (KPI) Scorecards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Inflow / Income */}
            <Card className="flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                  Total Inflow
                </span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowUpRight className="size-4" />
                </div>
              </div>
              <div className="my-2">
                <p className="font-display text-2xl font-bold text-emerald-600 tabular-nums">
                  {formatNaira(totalIncomeKobo)}
                </p>
              </div>
              <p className="text-[11px] text-mist border-t border-line/40 pt-2">
                Money received during this period
              </p>
            </Card>

            {/* Total Outflow / Expenses */}
            <Card className="flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                  Total Outflow
                </span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <ArrowDownRight className="size-4" />
                </div>
              </div>
              <div className="my-2">
                <p className="font-display text-2xl font-bold text-rose-600 tabular-nums">
                  {formatNaira(totalExpenseKobo)}
                </p>
              </div>
              <p className="text-[11px] text-mist border-t border-line/40 pt-2">
                Expenses and cash outlays recorded
              </p>
            </Card>

            {/* Net Surplus / Net Margin */}
            <Card className="flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                  Net Balance
                </span>
                <div
                  className={`flex size-7 items-center justify-center rounded-lg ${
                    isNetPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {isNetPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                </div>
              </div>
              <div className="my-2">
                <p
                  className={`font-display text-2xl font-bold tabular-nums ${
                    isNetPositive ? "text-ink" : "text-rose-600"
                  }`}
                >
                  {formatNaira(netKobo)}
                </p>
              </div>
              <p className="text-[11px] text-mist border-t border-line/40 pt-2">
                {isNetPositive ? "Net savings / profit margin" : "Net operating deficit"}
              </p>
            </Card>

            {/* Activity Count */}
            <Card className="flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                  Total Transactions
                </span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-sky-soft text-sky">
                  <Receipt className="size-4" />
                </div>
              </div>
              <div className="my-2">
                <p className="font-display text-2xl font-bold text-ink tabular-nums">
                  {txCount} {txCount === 1 ? "Record" : "Records"}
                </p>
              </div>
              <p className="text-[11px] text-mist border-t border-line/40 pt-2">
                Logged within reporting window
              </p>
            </Card>
          </div>

          {/* 2. Main Content Split: Category Breakdown & AI CFO Suggestions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Category Breakdown */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b border-line/60 bg-paper/20">
                <div className="flex items-center gap-2">
                  <PieChart className="size-4 text-sky" />
                  <h2 className="text-sm font-semibold text-ink">Category Spending &amp; Breakdown</h2>
                </div>
                <span className="text-xs text-mist">
                  {categories.length} {categories.length === 1 ? "category" : "categories"}
                </span>
              </CardHeader>
              <CardBody className="p-6 flex-1 flex flex-col justify-center">
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-paper border border-line text-mist mb-3">
                      <PieChart className="size-6 text-mist/80" />
                    </div>
                    <h3 className="text-sm font-semibold text-ink">No Category Spending Recorded</h3>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-mist">
                      {periodStart && periodEnd
                        ? `No expenses were logged between ${periodStart} and ${periodEnd}.`
                        : "Any transactions recorded for this period will automatically be categorized here."}
                    </p>
                    <div className="mt-5">
                      <Button href="/app/transactions" variant="secondary" className="text-xs">
                        + Record a Transaction
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((cat) => {
                      const pct = cat.percentage ?? Math.round((cat.amount_kobo / maxCategoryKobo) * 100);
                      return (
                        <div key={cat.category} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-ink">{cat.category}</span>
                            <div className="flex items-center gap-2 tabular-nums">
                              <span className="text-mist">
                                {cat.transaction_count ? `${cat.transaction_count} tx · ` : ""}
                                {pct}%
                              </span>
                              <span className="font-semibold text-ink">{formatNaira(cat.amount_kobo)}</span>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
                            <div
                              className="h-full rounded-full bg-sky transition-all duration-300"
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Right Col: AI CFO Financial Insights */}
            <Card className="border-sky/30 bg-sky-soft/20 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-sky/20">
                <Sparkles className="size-4 text-sky" />
                <h2 className="text-sm font-semibold text-ink">AI Financial Insights</h2>
              </CardHeader>
              <CardBody className="p-5 flex-1 flex flex-col justify-between">
                {suggestions.length === 0 ? (
                  <div className="space-y-4 py-4 text-center">
                    <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-sky/10 text-sky">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-ink">Financial Activity Healthy</h3>
                      <p className="mt-1 text-xs text-mist leading-relaxed">
                        No spending spikes or budget anomalies were detected during this period. Keep recording entries to receive automatic tax and cash-saving recommendations.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-sky/20 bg-white/80 p-3 text-xs leading-relaxed text-ink shadow-xs"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-sky">•</span>
                          <span>{sug}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-sky/20 text-center">
                  <Button href="/app/ai/chat" variant="primary" className="w-full text-xs py-2">
                    Discuss Report with AI CFO
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 3. Reporting Period Information Details */}
          <Card>
            <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-paper border border-line text-mist">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">Reporting Window</p>
                  <p className="text-xs text-mist">
                    {periodStart && periodEnd
                      ? `${periodStart} to ${periodEnd}`
                      : report?.period ?? "Standard accounting period"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-xs text-mist flex items-center gap-1"
                >
                  <ChevronDown className={`size-3.5 transition-transform ${showRawJson ? "rotate-180" : ""}`} />
                  {showRawJson ? "Hide technical data" : "View technical data"}
                </Button>
              </div>
            </CardBody>

            {/* Collapsible Technical Data (Only visible when user toggles) */}
            {showRawJson ? (
              <div className="border-t border-line/60 bg-paper/40 p-4">
                <p className="text-[11px] font-semibold text-mist uppercase tracking-wider mb-2">
                  Raw JSON Payload
                </p>
                <pre className="overflow-auto rounded-lg bg-paper border border-line p-3 font-mono text-[11px] text-ink">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </div>
            ) : null}
          </Card>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
