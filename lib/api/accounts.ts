import { apiRequest } from "@/lib/api/client";
import type { BankAccount } from "@/lib/api/types";

export const accountsApi = {
  list: (token: string) => apiRequest<BankAccount[]>("/accounts/", { token }),

  get: (token: string, accountId: string) =>
    apiRequest<BankAccount>(`/accounts/${accountId}/`, { token }),

  connect: (token: string, linkCode: string) =>
    apiRequest<BankAccount>("/accounts/", {
      method: "POST",
      token,
      body: { link_code: linkCode },
    }),

  remove: (token: string, accountId: string) =>
    apiRequest<void>(`/accounts/${accountId}/`, { method: "DELETE", token }),

  sync: (token: string, accountId: string) =>
    apiRequest<{ status: string }>(`/accounts/${accountId}/sync/`, {
      method: "POST",
      token,
    }),
};
