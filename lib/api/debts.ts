import { apiRequest } from "@/lib/api/client";
import type {
  ConfirmMatchPayload,
  CreateDebtPayload,
  Debt,
  DebtSource,
  DebtStatus,
  DebtSummary,
  DebtType,
  MarkPaidPayload,
  ReminderMessageResponse,
  UpdateDebtPayload,
} from "@/lib/api/types";

export type { CreateDebtPayload, UpdateDebtPayload };

export async function getDebtSummary(token: string, businessId?: string) {
  const qs = businessId ? `?business_id=${encodeURIComponent(businessId)}` : "";
  return apiRequest<DebtSummary>(`/debts/summary/${qs}`, { token });
}

export async function listDebts(
  token: string,
  params?: {
    status?: DebtStatus;
    business_id?: string;
    source?: DebtSource;
    type?: DebtType;
  } | DebtType,
) {
  const searchParams = new URLSearchParams();
  if (typeof params === "string") {
    searchParams.set("type", params);
  } else if (params) {
    if (params.status) searchParams.set("status", params.status);
    if (params.business_id) searchParams.set("business_id", params.business_id);
    if (params.source) searchParams.set("source", params.source);
    if (params.type) searchParams.set("type", params.type);
  }
  const qs = searchParams.toString();
  return apiRequest<Debt[]>(`/debts/${qs ? `?${qs}` : ""}`, { token });
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

export async function markPaid(token: string, id: string, body?: MarkPaidPayload) {
  return apiRequest<Debt>(`/debts/${id}/mark-paid/`, {
    method: "POST",
    body: body ?? {},
    token,
  });
}

export async function confirmMatch(token: string, id: string, body: ConfirmMatchPayload) {
  return apiRequest<{ success: boolean; debt?: Debt }>(`/debts/${id}/confirm-match/`, {
    method: "POST",
    body,
    token,
  });
}

export async function getReminderMessage(token: string, id: string) {
  return apiRequest<ReminderMessageResponse>(`/debts/${id}/reminder-message/`, {
    token,
  });
}
