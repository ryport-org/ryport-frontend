"use client";

import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { SimpleBarChart } from "@/components/staff/shared/simple-chart";
import { useStaffFetch } from "@/components/staff/hooks/use-staff-fetch";
import { Card, CardBody } from "@/components/staff/ui/card";
import { staffRevenueApi } from "@/lib/staff/api";

export default function RevenuePage() {
  const { data: summary, loading, error, reload } = useStaffFetch(
    (token) => staffRevenueApi.getSummary(token),
    [],
  );
  const { data: mrrChart } = useStaffFetch(
    (token) => staffRevenueApi.getMrrChart(12, token),
    [],
  );
  const { data: upgradesChart } = useStaffFetch(
    (token) => staffRevenueApi.getUpgradesChart(6, token),
    [],
  );

  return (
    <>
      <PageHeader title="Revenue" description="MRR, ARR, and plan changes" />
      <PageBody>
        <PermissionGate permission="can_view_revenue">
          {error ? <ApiErrorBanner message={error} onRetry={reload} /> : null}
          {loading ? (
            <LoadingGrid />
          ) : summary ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardBody>
                    <p className="text-xs text-muted">MRR</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.mrr_naira}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-xs text-muted">ARR</p>
                    <p className="mt-1 text-2xl font-semibold">{summary.arr_naira ?? "—"}</p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-xs text-muted">Growth</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {summary.mrr_growth_percent != null ? `${summary.mrr_growth_percent}%` : "—"}
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-xs text-muted">Paying users</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {summary.total_paying_users?.toLocaleString() ?? "—"}
                    </p>
                  </CardBody>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <SimpleBarChart title="MRR trend" chart={mrrChart ?? null} />
                <SimpleBarChart title="Upgrades" chart={upgradesChart ?? null} />
              </div>

              {summary.plan_breakdown ? (
                <Card>
                  <CardBody>
                    <h2 className="mb-4 text-sm font-semibold text-ink">Plan breakdown</h2>
                    <ul className="space-y-2">
                      {Object.entries(summary.plan_breakdown).map(([plan, info]) => (
                        <li key={plan} className="flex justify-between text-sm">
                          <span className="capitalize text-ink">{plan}</span>
                          <span className="text-muted">
                            {info.users} users · {info.mrr_naira}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              ) : null}
            </div>
          ) : !error ? (
            <p className="text-sm text-muted">No revenue data.</p>
          ) : null}
        </PermissionGate>
      </PageBody>
    </>
  );
}
