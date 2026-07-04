import { staffRequest } from "@/lib/api/client";
import type { ChartData, DashboardOverview } from "@/lib/api/types";

export async function getOverview(token?: string | null) {
  return staffRequest<DashboardOverview>("/dashboard/overview/", { token });
}

export async function getUserGrowthChart(days = 30, token?: string | null) {
  return staffRequest<ChartData>(`/dashboard/charts/user-growth/?days=${days}`, { token });
}

export async function getRevenueChart(months = 12, token?: string | null) {
  return staffRequest<ChartData>(`/dashboard/charts/revenue/?months=${months}`, { token });
}

export async function getTransactionsChart(days = 30, token?: string | null) {
  return staffRequest<ChartData>(`/dashboard/charts/transactions/?days=${days}`, { token });
}

export async function getAiUsageChart(days = 14, token?: string | null) {
  return staffRequest<ChartData>(`/dashboard/charts/ai-usage/?days=${days}`, { token });
}
