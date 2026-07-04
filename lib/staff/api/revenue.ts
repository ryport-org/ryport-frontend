import { staffRequest } from "@/lib/staff/api/client";
import { buildQuery } from "@/lib/staff/api/query";
import type { ChartData, Paginated, PlanChangeEntry, RevenueSummary } from "@/lib/staff/api/types";

export async function getSummary(token?: string | null) {
  return staffRequest<RevenueSummary>("/revenue/summary/", { token });
}

export async function getMrrChart(months = 12, token?: string | null) {
  return staffRequest<ChartData>(`/revenue/charts/mrr/${buildQuery({ months })}`, { token });
}

export async function getUpgradesChart(months = 6, token?: string | null) {
  return staffRequest<ChartData>(`/revenue/charts/upgrades/${buildQuery({ months })}`, { token });
}

export async function listPlanChanges(
  params: {
    direction?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  } = {},
  token?: string | null,
) {
  return staffRequest<Paginated<PlanChangeEntry>>(
    `/revenue/plan-changes/${buildQuery(params)}`,
    { token },
  );
}
