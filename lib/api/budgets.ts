import { apiRequest } from "@/lib/api/client";
import type { Budget, BudgetUsage } from "@/lib/api/types";

export async function listBudgets(token: string) {
  return apiRequest<Budget[]>("/budgets/", { token });
}

export async function createBudget(
  token: string,
  body: { category: string; limit_kobo: number; period: "weekly" | "monthly" },
) {
  return apiRequest<Budget>("/budgets/", { method: "POST", body, token });
}

export async function getBudget(token: string, id: string) {
  return apiRequest<Budget>(`/budgets/${id}/`, { token });
}

export async function updateBudget(
  token: string,
  id: string,
  body: Partial<{ category: string; limit_kobo: number; period: string }>,
) {
  return apiRequest<Budget>(`/budgets/${id}/`, { method: "PATCH", body, token });
}

export async function deleteBudget(token: string, id: string) {
  return apiRequest<null>(`/budgets/${id}/`, { method: "DELETE", token });
}

export async function getBudgetUsage(token: string, id: string) {
  return apiRequest<BudgetUsage>(`/budgets/${id}/usage/`, { token });
}

export async function getBudgetAlerts(token: string, id: string) {
  return apiRequest<Record<string, unknown>[]>(`/budgets/${id}/alerts/`, { token });
}

export async function checkBudgetAlerts(token: string, id: string) {
  return apiRequest<Record<string, unknown>>(`/budgets/${id}/check-alerts/`, {
    method: "POST",
    token,
  });
}
