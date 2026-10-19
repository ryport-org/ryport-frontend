import { apiRequest } from "@/lib/api/client";
import type {
  CursorPage,
  SmsIngestData,
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/lib/api/types";

export type TransactionFilters = {
  cursor?: string;
  page_size?: number;
  date_from?: string;
  date_to?: string;
  category?: string;
  type?: TransactionType;
  account_id?: string;
  source?: string;
};

export async function listTransactions(token: string, filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return apiRequest<CursorPage<Transaction>>(
    `/transactions/${qs ? `?${qs}` : ""}`,
    { token },
  );
}

export async function getTransaction(token: string, id: string) {
  return apiRequest<Transaction>(`/transactions/${id}/`, { token });
}

export async function createTransaction(
  token: string,
  body: {
    amount_kobo: number;
    type: TransactionType;
    category: TransactionCategory | string;
    description: string;
    merchant: string;
    account_id?: string | null;
    transaction_date: string;
    idempotency_key: string;
  },
) {
  return apiRequest<Transaction>("/transactions/", { method: "POST", body, token });
}

export async function deleteTransaction(token: string, id: string) {
  return apiRequest<null>(`/transactions/${id}/`, { method: "DELETE", token });
}

export async function categoriseTransaction(token: string, id: string) {
  return apiRequest<Transaction>(`/transactions/${id}/categorise/`, {
    method: "POST",
    token,
  });
}

export async function uploadReceipt(token: string, id: string, file: File) {
  const form = new FormData();
  form.append("receipt", file);
  return apiRequest<Transaction>(`/transactions/${id}/receipt/`, {
    method: "POST",
    body: form,
    token,
  });
}

export async function smsIngest(
  token: string,
  body: {
    raw_text: string;
    sender?: string;
    received_at?: string;
  },
) {
  try {
    return await apiRequest<SmsIngestData>("/transactions/sms/ingest/", {
      method: "POST",
      body,
      token,
    });
  } catch (err: unknown) {
    const errorObj = err as { code?: string; status?: number; message?: string };
    if (errorObj?.status === 503 || errorObj?.code === "feature_paused") {
      throw new Error("SMS import is currently paused. Please use manual entry or receipt upload.");
    }
    // Also try legacy path if 404
    if (errorObj?.status === 404) {
      try {
        return await apiRequest<SmsIngestData>("/transactions/sms-ingest/", {
          method: "POST",
          body,
          token,
        });
      } catch (err2: unknown) {
        const errorObj2 = err2 as { code?: string; status?: number; message?: string };
        if (errorObj2?.status === 503 || errorObj2?.code === "feature_paused") {
          throw new Error("SMS import is currently paused. Please use manual entry or receipt upload.");
        }
        throw err2;
      }
    }
    throw err;
  }
}
