import { apiRequest } from "@/lib/api/client";
import type { Debt, DebtType, DebtStatus } from "@/lib/api/types";

export type CreateDebtPayload = {
  counterparty: string;
  amount_kobo: number;
  type: DebtType;
  description: string;
  due_date?: string | null;
  status?: DebtStatus;
};

export type UpdateDebtPayload = Partial<CreateDebtPayload>;

export async function listDebts(token: string, type?: DebtType) {
  const qs = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiRequest<Debt[]>(`/debts/${qs}`, { token });
}

export async function getDebt(token: string, id: string) {
  return apiRequest<Debt>(`/debts/${id}/`, { token });
}

export async function createDebt(token: string, body: CreateDebtPayload) {
  return apiRequest<Debt>("/debts/", {
    method: "POST",
    body,
    token,
  });
}

export async function updateDebt(token: string, id: string, body: CreateDebtPayload) {
  return apiRequest<Debt>(`/debts/${id}/`, {
    method: "PUT",
    body,
    token,
  });
}

export async function patchDebt(token: string, id: string, body: UpdateDebtPayload) {
  return apiRequest<Debt>(`/debts/${id}/`, {
    method: "PATCH",
    body,
    token,
  });
}

export async function deleteDebt(token: string, id: string) {
  return apiRequest<null>(`/debts/${id}/`, {
    method: "DELETE",
    token,
  });
}
