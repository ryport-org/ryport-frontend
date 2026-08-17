import { apiRequest } from "@/lib/api/client";
import type {
  AIQuota,
  Budget,
  BudgetUsage,
  PersonalDashboardData,
  SmeDashboardData,
  Transaction,
} from "@/lib/api/types";

export type DashboardOverview = {
  net_position_kobo?: number;
  income_kobo?: number;
  expense_kobo?: number;
  linked_accounts_count?: number;
  recent_transactions?: Transaction[];
  budgets?: (Budget & { usage?: BudgetUsage })[];
  ai_quota?: AIQuota | null;
  runway_days?: number | null;
  days_until_low?: number | null;
  unread_notifications?: number;
  alerts?: Array<{ id: string; message: string; severity?: string }>;
};

export async function getOverview(token?: string | null) {
  return apiRequest<DashboardOverview>("/dashboard/overview/", { token });
}

export async function getPersonalDashboard(token?: string | null) {
  return apiRequest<PersonalDashboardData>("/dashboard/personal/", { token });
}

export async function getSmeDashboard(token?: string | null, businessId?: string) {
  const path = businessId ? `/dashboard/sme/?business_id=${businessId}` : "/dashboard/sme/";
  const headers = businessId ? { "X-Business-ID": businessId } : undefined;
  return apiRequest<SmeDashboardData>(path, { token, headers });
}
