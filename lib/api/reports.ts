import { apiRequest, apiRequestRaw } from "@/lib/api/client";
import type { Report } from "@/lib/api/types";

export async function listReports(token: string) {
  return apiRequest<Report[]>("/reports/", { token });
}

export async function generateReport(
  token: string,
  body: { type: "monthly" | "weekly" | "pl"; period?: string },
) {
  return apiRequest<Report>("/reports/generate/", { method: "POST", body, token });
}

export async function getReport(token: string, id: string) {
  return apiRequest<Report>(`/reports/${id}/`, { token });
}

export async function exportReport(
  token: string,
  id: string,
  format: "pdf" | "csv" | "xlsx",
) {
  const res = await apiRequestRaw(
    `/reports/${id}/export/?export_format=${format}`,
    { token },
  );
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json?.error?.message ?? "Export failed");
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const filename =
    disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? `report.${format}`;
  return { blob, filename };
}
