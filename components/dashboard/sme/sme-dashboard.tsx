"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Users,
  ShieldAlert,
  Zap,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  FileBarChart,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi, dashboardApi } from "@/lib/api";
import type { Business, SmeDashboardData } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export function SmeDashboard() {
  const { bootstrap } = useAuth();
  const [data, setData] = useState<SmeDashboardData | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const fetchSmeData = useCallback(async (isManualRefresh = false) => {
    const token = getAccessToken();
    if (!token) return;

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [smeRes, bizList] = await Promise.all([
        dashboardApi.sme(token),
        businessesApi.list(token).catch(() => []),
      ]);
      setData(smeRes);
      setBusinesses(bizList);
    } catch {
      // Auto-recovery: If initial SME call failed (e.g. active business not set in backend session),
      // fetch business list and auto-switch to the first available business
      try {
        const bizList = await businessesApi.list(token);
        setBusinesses(bizList);
        if (bizList.length > 0) {
          await businessesApi.switch(token, bizList[0].id);
          await bootstrap(token).catch(() => {});
          const smeRes = await dashboardApi.sme(token);
          setData(smeRes);
          return;
        }
      } catch {
        // Fallback if auto-recovery also fails
      }
      setError("Could not load business dashboard data. Ensure your active business is selected.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bootstrap]);

  useEffect(() => {
    void fetchSmeData();
  }, [fetchSmeData]);

  const handleSwitchBusiness = async (bizId: string) => {
    const token = getAccessToken();
    if (!token) return;
    setSwitching(true);
    setSwitcherOpen(false);

    try {
      await businessesApi.switch(token, bizId);
      await bootstrap(token);
      await fetchSmeData(true);
    } catch {
      setError("Failed to switch active business.");
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return <SmeDashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="border-coral-warn/30 bg-coral-warn/5">
        <CardBody className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-coral-warn">{error ?? "Failed to load SME dashboard."}</p>
          <div className="flex items-center gap-2">
            {businesses.length > 1 ? (
              <select
                onChange={(e) => void handleSwitchBusiness(e.target.value)}
                defaultValue=""
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink"
              >
                <option value="" disabled>Switch Business...</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => void fetchSmeData(true)}>
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const {
    active_business,
    runway,
    pl_snapshot,
    cost_anomalies,
    staff_summary,
    tax_status,
    energy_cost_trend,
    team_summary,
  } = data;

  return (
    <div className="space-y-6">
      {/* Business Header & Manual Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sky text-white">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl text-ink">{active_business?.name ?? "Business Overview"}</h1>
                {businesses.length > 1 ? (
                  <button
                    type="button"
                    disabled={switching}
                    onClick={() => setSwitcherOpen(!switcherOpen)}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-medium text-ink hover:bg-paper focus:outline-none"
                  >
                    Switch <ChevronDown className="size-3 text-mist" />
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-mist">
                {active_business?.type ?? "Enterprise Workspace"} • Currency: {active_business?.currency ?? "NGN"}
              </p>
            </div>
          </div>

          {/* Business Switcher Dropdown */}
          {switcherOpen && businesses.length > 1 ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-line bg-white p-2 shadow-lg">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-mist">Your Businesses</p>
              <div className="mt-1 space-y-1">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => void handleSwitchBusiness(b.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left min-h-[44px] ${
                      b.id === active_business?.id ? "bg-sky-soft text-sky font-semibold" : "hover:bg-paper text-ink"
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    {b.id === active_business?.id ? <CheckCircle2 className="size-3.5 shrink-0" /> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Manual Refresh Button (respecting 5-min server cache) */}
        <Button
          type="button"
          variant="secondary"
          disabled={refreshing}
          onClick={() => void fetchSmeData(true)}
          className="self-start text-xs min-h-[44px] sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </Button>
      </div>

      {/* 1. Prominent Runway & Burn Rate Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-sky/20 bg-sky-soft/30 h-full">
          <CardBody className="flex flex-col justify-between p-5 h-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky">Financial Runway</span>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-display text-3xl text-ink">
                {runway?.runway_months != null ? `${runway.runway_months} months` : runway?.runway_days != null ? `${runway.runway_days} days` : "N/A"}
              </span>
            </div>
            <p className="mt-1 text-xs text-mist pt-1 border-t border-sky/10">
              Based on active cash balance and current monthly burn rate.
            </p>
          </CardBody>
        </Card>

        <Card className="h-full">
          <CardBody className="flex flex-col justify-between p-5 h-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist">Monthly Burn Rate</span>
            <div className="my-2 font-display text-2xl text-ink">
              {formatNaira(runway?.burn_rate_monthly_kobo ?? 0)}
            </div>
            <p className="mt-1 text-xs text-mist pt-1 border-t border-line/40">Average net cash outflow per month.</p>
          </CardBody>
        </Card>

        {/* Team Summary Box */}
        <Card className="sm:col-span-2 lg:col-span-1 h-full">
          <CardBody className="flex flex-col justify-between p-5 h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-mist">Team Workspace</span>
              <Users className="size-4 text-sky" />
            </div>
            <div className="my-2">
              <p className="font-display text-2xl text-ink">{team_summary?.member_count ?? 0} Members</p>
              <p className="text-xs text-mist">
                {team_summary?.pending_invites_count ?? 0} pending invite{(team_summary?.pending_invites_count ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="pt-1 border-t border-line/40 text-right">
              <Link
                href={`/app/businesses/${active_business?.id ?? ""}/team`}
                className="inline-flex items-center gap-1 text-xs font-medium text-sky hover:underline"
              >
                Manage team <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 2. P&L Snapshot Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileBarChart className="size-4 text-sky" />
            <h2 className="text-sm font-semibold text-ink">P&L Snapshot ({pl_snapshot?.period ?? "This Month"})</h2>
          </div>
          <Link
            href="/app/reports"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky hover:underline"
          >
            Full P&L Report <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-paper/50 p-4">
              <span className="text-xs text-mist">Revenue</span>
              <p className="mt-1 font-display text-lg text-emerald-600">
                {formatNaira(pl_snapshot?.revenue_kobo ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper/50 p-4">
              <span className="text-xs text-mist">Operating Expenses</span>
              <p className="mt-1 font-display text-lg text-rose-600">
                {formatNaira(pl_snapshot?.expenses_kobo ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper/50 p-4">
              <span className="text-xs text-mist">Net Profit / Loss</span>
              <p className={`mt-1 font-display text-lg ${(pl_snapshot?.net_profit_kobo ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatNaira(pl_snapshot?.net_profit_kobo ?? 0)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 3. Cost Anomaly Alerts & Staff Cost Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost Anomaly Alerts (Distinct Business Risk Treatment) */}
        <Card className="border-rose-300/40 bg-rose-50/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertOctagon className="size-4 text-rose-600" />
              <h2 className="text-sm font-semibold text-rose-950">Cost Anomaly & Risk Alerts</h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {(!cost_anomalies || cost_anomalies.length === 0) ? (
              <p className="py-4 text-xs text-mist">No cost anomalies detected across business categories.</p>
            ) : (
              <div className="space-y-3">
                {cost_anomalies.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-rose-200 bg-white p-3 shadow-xs"
                  >
                    <AlertOctagon className="size-4 shrink-0 text-rose-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-ink">{item.category}</span>
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          +{item.increase_percent}% increase
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-mist leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Staff Cost Summary & Missed Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Staff Payroll & Payments</h2>
            <Link
              href={`/app/businesses/${active_business?.id ?? ""}/team`}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky hover:underline"
            >
              Team Details <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <div className="flex justify-between items-center rounded-xl bg-paper p-4 border border-line">
              <div>
                <span className="text-xs text-mist">Total Payroll</span>
                <p className="font-display text-lg text-ink">
                  {formatNaira(staff_summary?.total_payroll_kobo ?? 0)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-mist">Active Staff</span>
                <p className="font-display text-lg text-ink">{staff_summary?.staff_count ?? 0}</p>
              </div>
            </div>

            {(staff_summary?.missed_payments ?? 0) > 0 ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-semibold">{staff_summary.missed_payments} missed payment flag(s) detected!</span>
                  {staff_summary.missed_payment_flags?.map((flag, idx) => (
                    <p key={idx} className="mt-0.5 text-[11px] text-amber-800">{flag}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>All staff payroll payments are up to date.</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 4. Tax Status Strip (Compliance Requirement - Legible across all breakpoints) */}
      <Card className="border-brand/30 bg-white">
        <CardBody className="p-5 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-brand shrink-0" />
              <div>
                <h3 className="font-semibold text-sm text-ink">Tax Status & Compliance Summary</h3>
                <p className="text-xs text-mist">CIT & VAT filing verification</p>
              </div>
            </div>

            {/* Verification Date Tag - ALWAYS visible next to figures */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <span className="rounded-md border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-mono font-medium text-brand">
                Last Verified: {tax_status?.last_verified_date ?? "Pending"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line p-3 bg-paper/30">
              <span className="text-xs text-mist">Companies Income Tax (CIT)</span>
              <p className="text-sm font-semibold text-ink mt-0.5">{tax_status?.cit_status ?? "Unverified"}</p>
            </div>
            <div className="rounded-lg border border-line p-3 bg-paper/30">
              <span className="text-xs text-mist">Value Added Tax (VAT)</span>
              <p className="text-sm font-semibold text-ink mt-0.5">{tax_status?.vat_status ?? "Unverified"}</p>
            </div>
          </div>

          {/* Mandatory Inline Disclaimer - Never hidden/truncated on mobile */}
          <div className="border-t border-line/60 pt-3">
            <p className="text-[11px] leading-normal text-mist font-medium">
              ⚠️ <span className="font-semibold text-ink">Disclaimer:</span> This summary is generated from linked financial transactions and is for informational purposes only. It does not constitute formal tax advice. Always confirm filing requirements with your certified accountant or tax consultant.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* 5. Energy Cost Trend (Rendered ONLY if non-null) */}
      {energy_cost_trend ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-ink">Energy & Utility Cost Trend</h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs text-mist">Current Month Energy Spend</span>
                <p className="font-display text-xl text-ink">
                  {formatNaira(energy_cost_trend.current_month_kobo)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {energy_cost_trend.change_percent > 0 ? (
                  <span className="flex items-center gap-1 text-rose-600">
                    <TrendingUp className="size-4" /> +{energy_cost_trend.change_percent}% vs last month
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <TrendingDown className="size-4" /> {energy_cost_trend.change_percent}% vs last month
                  </span>
                )}
              </div>
            </div>

            {energy_cost_trend.data_points?.length ? (
              <div className="space-y-2 pt-2 border-t border-line/60">
                <span className="text-xs font-medium text-mist">Monthly Breakdown</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {energy_cost_trend.data_points.map((pt, i) => (
                    <div key={i} className="rounded-lg bg-paper p-2.5 border border-line text-xs">
                      <span className="text-mist">{pt.month}</span>
                      <p className="font-semibold text-ink mt-0.5">{formatNaira(pt.amount_kobo)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function SmeDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-44 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
