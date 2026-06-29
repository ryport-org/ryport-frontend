import { apiRequest } from "@/lib/api/client";
import type { Budget, BudgetUsage } from "@/lib/api/types";

export const budgetsApi = {
  list: (token: string) => apiRequest<Budget[]>("/budgets/", { token }),

  get: (token: string, id: string) =>
    apiRequest<Budget>(`/budgets/${id}/`, { token }),

  create: (
    token: string,
    body: {
      name: string;
      category: string;
      limit_kobo: number;
      period: string;
    },
  ) => apiRequest<Budget>("/budgets/", { method: "POST", token, body }),

  update: (token: string, id: string, body: Partial<Budget>) =>
    apiRequest<Budget>(`/budgets/${id}/`, { method: "PATCH", token, body }),

  remove: (token: string, id: string) =>
    apiRequest<void>(`/budgets/${id}/`, { method: "DELETE", token }),

  usage: (token: string, id: string) =>
    apiRequest<BudgetUsage>(`/budgets/${id}/usage/`, { token }),

  alerts: (token: string, id: string) =>
    apiRequest<unknown[]>(`/budgets/${id}/alerts/`, { token }),

  checkAlerts: (token: string, id: string) =>
    apiRequest<void>(`/budgets/${id}/check-alerts/`, { method: "POST", token }),
};
