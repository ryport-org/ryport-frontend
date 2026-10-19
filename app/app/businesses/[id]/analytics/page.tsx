"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Building2,
  Calendar,
  ChevronDown,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi } from "@/lib/api";
import { formatNaira } from "@/lib/format";

export default function BusinessAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    businessesApi
      .analytics(token, id, 90)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  const revenueKobo = Number(data?.revenue_kobo ?? data?.total_revenue_kobo ?? 0);
  const expensesKobo = Number(data?.expenses_kobo ?? data?.total_expenses_kobo ?? 0);
  const netKobo = Number(data?.net_profit_kobo ?? data?.net_kobo ?? (revenueKobo - expensesKobo));
  const isNetPositive = netKobo >= 0;

  return (
    <AppPage>
      <AppHeader
        title="Business Analytics"
        description="90-day revenue and expense performance overview"
      />

      <AppPageBody>
        <AppPageContent className="space-y-6">
          <PlanGate feature="business_dashboard">
            <div className="flex items-center justify-between">
              <Link
                href={`/app/businesses/${id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"
              >
                <ArrowLeft className="size-3.5" /> Back to Business
              </Link>
            </div>

            {loading ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* 3 KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                        90-Day Revenue
                      </span>
                      <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <ArrowUpRight className="size-4" />
                      </div>
                    </div>
                    <div className="my-2">
                      <p className="font-display text-2xl font-bold text-emerald-600 tabular-nums">
                        {formatNaira(revenueKobo)}
                      </p>
                    </div>
                    <p className="text-[11px] text-mist border-t border-line/40 pt-2">
                      Total customer inflow &amp; sales
                    </p>
                  </Card>

                  <Card className="p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                        90-Day Expenses
                      </span>
                      <div className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <ArrowDownRight className="size-4" />
                      </div>
                    </div>
                    <div className="my-2">
                      <p className="font-display text-2xl font-bold text-rose-600 tabular-nums">
                        {formatNaira(expensesKobo)}
                      </p>
                    </div>
                    <p className="text-[11px] text-mist border-t border-line/40 pt-2">
                      Operational and direct costs
                    </p>
                  </Card>

                  <Card className="p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-mist">
                        Net Operating Profit
                      </span>
                      <div
                        className={`flex size-7 items-center justify-center rounded-lg ${
                          isNetPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <TrendingUp className="size-4" />
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
                      {isNetPositive ? "Healthy operating surplus" : "Operating cash deficit"}
                    </p>
                  </Card>
                </div>

                {/* Additional Performance Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-sky" />
                      <h2 className="text-sm font-semibold text-ink">Analytics Overview</h2>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="rounded-xl border border-dashed border-line p-8 text-center">
                      <Building2 className="mx-auto size-8 text-mist mb-2" />
                      <h3 className="text-sm font-semibold text-ink">90-Day Performance Window</h3>
                      <p className="mt-1 max-w-md mx-auto text-xs text-mist leading-relaxed">
                        Metrics are aggregated across all settled invoices, recorded transactions, and staff payroll for this workspace.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-end">
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

                    {showRawJson ? (
                      <pre className="mt-3 overflow-auto rounded-lg bg-paper border border-line p-3 font-mono text-[11px] text-ink">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    ) : null}
                  </CardBody>
                </Card>
              </div>
            )}
          </PlanGate>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
