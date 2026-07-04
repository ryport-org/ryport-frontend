"use client";

import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/staff/dashboard/activity-feed";
import { AlertsList } from "@/components/staff/dashboard/alerts-list";
import { KpiGrid } from "@/components/staff/dashboard/kpi-grid";
import { PlanDistribution } from "@/components/staff/dashboard/plan-distribution";
import { ServiceStatusPanel } from "@/components/staff/dashboard/service-status";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { SimpleBarChart } from "@/components/staff/shared/simple-chart";
import { staffDashboardApi } from "@/lib/staff/api";
import type { ChartData, DashboardOverview } from "@/lib/staff/api/types";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [userGrowth, setUserGrowth] = useState<ChartData | null>(null);
  const [revenueChart, setRevenueChart] = useState<ChartData | null>(null);

  async function load() {
    const token = getStaffAccessToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [overviewData, growth, revenue] = await Promise.all([
        staffDashboardApi.getOverview(token),
        staffDashboardApi.getUserGrowthChart(30, token).catch(() => null),
        staffDashboardApi.getRevenueChart(12, token).catch(() => null),
      ]);
      setOverview(overviewData);
      setUserGrowth(growth);
      setRevenueChart(revenue);
    } catch {
      setError("Could not load dashboard overview. The stats cache may be rebuilding — try again.");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="KPIs, service health, and recent activity across Ryport"
      />
      <PageBody>
        {error ? <div className="mb-6"><ApiErrorBanner message={error} onRetry={() => void load()} /></div> : null}

        {loading ? (
          <div className="space-y-6">
            <LoadingGrid />
            <div className="h-64 animate-pulse rounded-lg bg-border/60" />
          </div>
        ) : overview ? (
          <div className="space-y-6">
            <KpiGrid kpis={overview.kpis} />

            <div className="grid gap-6 lg:grid-cols-2">
              <SimpleBarChart title="User growth (30d)" chart={userGrowth} />
              <SimpleBarChart title="Revenue (12mo)" chart={revenueChart} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <PlanDistribution distribution={overview.plan_distribution} />
                <ActivityFeed activity={overview.recent_activity} />
              </div>
              <div className="space-y-6">
                <AlertsList alerts={overview.system_alerts} />
                <ServiceStatusPanel serviceStatus={overview.service_status} />
              </div>
            </div>
          </div>
        ) : !error ? (
          <p className="text-sm text-muted">No overview data available.</p>
        ) : null}
      </PageBody>
    </>
  );
}
