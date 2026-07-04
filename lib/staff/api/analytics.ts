import { staffRequest } from "@/lib/staff/api/client";
import type { AnalyticsPayload } from "@/lib/staff/api/types";

export async function getFeatureAdoption(token?: string | null) {
  return staffRequest<AnalyticsPayload>("/analytics/feature-adoption/", { token });
}

export async function getEngagement(token?: string | null) {
  return staffRequest<AnalyticsPayload>("/analytics/engagement/", { token });
}

export async function getAiAnalytics(token?: string | null) {
  return staffRequest<AnalyticsPayload>("/analytics/ai/", { token });
}

export async function getBankingAnalytics(token?: string | null) {
  return staffRequest<AnalyticsPayload>("/analytics/banking/", { token });
}

export async function getTransactionAnalytics(token?: string | null) {
  return staffRequest<AnalyticsPayload>("/analytics/transactions/", { token });
}
