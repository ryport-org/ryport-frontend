import { apiRequest } from "@/lib/api/client";
import type { CursorPage, Transaction } from "@/lib/api/types";

export type TransactionFilters = {
  date_from?: string;
  date_to?: string;
  category?: string;
  type?: string;
  account_id?: string;
  cursor?: string;
};

export const transactionsApi = {
  list: (token: string, filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters?.date_from) params.set("date_from", filters.date_from);
    if (filters?.date_to) params.set("date_to", filters.date_to);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.account_id) params.set("account_id", filters.account_id);
    if (filters?.cursor) params.set("cursor", filters.cursor);
    const qs = params.toString();
    const path = qs ? `/transactions/?${qs}` : "/transactions/";
    return apiRequest<CursorPage<Transaction> | Transaction[]>(path, { token });
  },

  get: (token: string, id: string) =>
    apiRequest<Transaction>(`/transactions/${id}/`, { token }),

  create: (
    token: string,
    body: {
      amount_kobo: number;
      type: string;
      category?: string;
      description?: string;
      account_id?: string;
      date: string;
      idempotency_key: string;
    },
  ) =>
    apiRequest<Transaction>("/transactions/", { method: "POST", token, body }),

  remove: (token: string, id: string) =>
    apiRequest<void>(`/transactions/${id}/`, { method: "DELETE", token }),

  categorise: (token: string, id: string) =>
    apiRequest<Transaction>(`/transactions/${id}/categorise/`, {
      method: "POST",
      token,
    }),

  uploadReceipt: (token: string, id: string, file: File) => {
    const form = new FormData();
    form.append("receipt", file);
    return apiRequest<Transaction>(`/transactions/${id}/receipt/`, {
      method: "POST",
      token,
      body: form,
    });
  },
};

export function normalizeTransactions(
  data: CursorPage<Transaction> | Transaction[],
): Transaction[] {
  return Array.isArray(data) ? data : data.results ?? [];
}
