import { staffRequest } from "@/lib/staff/api/client";
import { buildQuery } from "@/lib/staff/api/query";
import type { AuditEntry, Paginated } from "@/lib/staff/api/types";

export type AuditListParams = {
  staff_user_id?: string;
  action?: string;
  resource?: string;
  date_from?: string;
  date_to?: string;
  q?: string;
  page?: number;
};

export async function listAudit(params: AuditListParams = {}, token?: string | null) {
  return staffRequest<Paginated<AuditEntry>>(`/audit/${buildQuery(params)}`, { token });
}

export async function exportAudit(
  params: { date_from?: string; date_to?: string } = {},
  token?: string | null,
) {
  return staffRequest<Blob>(`/audit/export/${buildQuery(params)}`, { token });
}
