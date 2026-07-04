"use client";

import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AlertsList } from "@/components/dashboard/alerts-list";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { PlanDistribution } from "@/components/dashboard/plan-distribution";
import { ServiceStatusPanel } from "@/components/dashboard/service-status";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { staffDashboardApi } from "@/lib/api";
import type { DashboardOverview } from "@/lib/api/types";
import { getStaffAccessToken } from "@/lib/auth/tokens";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  async function loadOverview() {
    const token = getStaffAccessToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await staffDashboardApi.getOverview(token);
      setOverview(data);
    } catch {
      setError("Could not load dashboard overview. The stats cache may be rebuilding — try again.");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="KPIs, service health, and recent activity across Ryport"
      />
      <PageBody>
        {error ? (
          <Card className="mb-6 border-danger/30 bg-danger/5">
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-danger">{error}</p>
              <Button type="button" variant="secondary" onClick={() => void loadOverview()}>
                Retry
              </Button>
            </CardBody>
          </Card>
        ) : null}

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : overview ? (
          <div className="space-y-6">
            <KpiGrid kpis={overview.kpis} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
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
