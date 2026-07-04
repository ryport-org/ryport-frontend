import { staffRequest } from "@/lib/staff/api/client";
import { buildQuery } from "@/lib/staff/api/query";
import type { CeleryStatus, SystemAlert, SystemErrorEntry, SystemHealth } from "@/lib/staff/api/types";

export async function getHealth(token?: string | null) {
  return staffRequest<SystemHealth>("/system/health/", { token });
}

export async function getCelery(token?: string | null) {
  return staffRequest<CeleryStatus>("/system/celery/", { token });
}

export async function getErrors(token?: string | null) {
  return staffRequest<SystemErrorEntry[]>("/system/errors/", { token });
}

export async function listAlerts(
  params: { resolved?: boolean } = {},
  token?: string | null,
) {
  return staffRequest<SystemAlert[]>(`/system/alerts/${buildQuery(params)}`, { token });
}

export async function createAlert(
  body: { title: string; message: string; severity: string },
  token?: string | null,
) {
  return staffRequest<SystemAlert>("/system/alerts/", { method: "POST", body, token });
}

export async function resolveAlert(alertId: string, token?: string | null) {
  return staffRequest<void>(`/system/alerts/${alertId}/resolve/`, { method: "POST", token });
}
