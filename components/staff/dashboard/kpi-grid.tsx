import type { DashboardKpis } from "@/lib/staff/api/types";
import { Card, CardBody } from "@/components/staff/ui/card";

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}

export function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Total users" value={kpis.total_users.toLocaleString()} />
      <KpiCard
        label="Active today"
        value={kpis.active_users_today.toLocaleString()}
        hint={`+${kpis.new_users_this_week} this week`}
      />
      <KpiCard
        label="MRR"
        value={kpis.mrr_naira ?? "—"}
        hint={kpis.arr_naira ? `ARR ${kpis.arr_naira}` : undefined}
      />
      <KpiCard
        label="Transactions"
        value={kpis.total_transactions.toLocaleString()}
        hint={`${kpis.ai_messages_today} AI msgs today`}
      />
      <KpiCard
        label="New this month"
        value={kpis.new_users_this_month.toLocaleString()}
      />
      <KpiCard
        label="Bank connections"
        value={kpis.active_bank_connections.toLocaleString()}
      />
    </div>
  );
}
