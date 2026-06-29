import { apiRequest, apiRequestRaw } from "@/lib/api/client";
import type { Report } from "@/lib/api/types";

export const reportsApi = {
  list: (token: string, type?: string) => {
    const qs = type ? `?type=${type}` : "";
    return apiRequest<Report[]>(`/reports/${qs}`, { token });
  },

  generate: (token: string, body: { type: string; period?: string }) =>
    apiRequest<Report>("/reports/generate/", { method: "POST", token, body }),

  get: (token: string, id: string) =>
    apiRequest<Report>(`/reports/${id}/`, { token }),

  export: (token: string, id: string, format: "pdf" | "csv" | "xlsx") =>
    apiRequestRaw(`/reports/${id}/export/?export_format=${format}`, { token }),
};
