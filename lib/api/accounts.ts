import { apiRequest } from "@/lib/api/client";
import type { BankAccount } from "@/lib/api/types";

export async function listAccounts(token: string) {
  return apiRequest<BankAccount[]>("/accounts/", { token });
}

export async function linkAccount(token: string, code: string) {
  return apiRequest<BankAccount>("/accounts/", {
    method: "POST",
    body: { code },
    token,
  });
}

export async function getAccount(token: string, id: string) {
  return apiRequest<BankAccount>(`/accounts/${id}/`, { token });
}

export async function disconnectAccount(token: string, id: string) {
  return apiRequest<null>(`/accounts/${id}/`, { method: "DELETE", token });
}

export async function syncAccount(token: string, id: string) {
  return apiRequest<{ synced_count: number }>(`/accounts/${id}/sync/`, {
    method: "POST",
    token,
  });
}
