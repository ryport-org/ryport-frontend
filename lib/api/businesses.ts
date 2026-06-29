import { apiRequest } from "@/lib/api/client";
import type { Business } from "@/lib/api/types";

export const businessesApi = {
  list: (token: string) => apiRequest<Business[]>("/businesses/", { token }),

  active: (token: string) => apiRequest<Business>("/businesses/active/", { token }),

  get: (token: string, id: string) =>
    apiRequest<Business>(`/businesses/${id}/`, { token }),

  create: (token: string, body: { name: string; industry?: string }) =>
    apiRequest<Business>("/businesses/", { method: "POST", token, body }),

  switch: (token: string, id: string) =>
    apiRequest<void>(`/businesses/${id}/switch/`, { method: "POST", token }),

  analytics: (token: string, id: string, days = 365) =>
    apiRequest<Record<string, unknown>>(
      `/businesses/${id}/analytics/?days=${days}`,
      { token },
    ),

  members: (token: string, id: string) =>
    apiRequest<unknown[]>(`/businesses/${id}/members/`, { token }),

  inviteMember: (token: string, id: string, email: string) =>
    apiRequest<void>(`/businesses/${id}/members/`, {
      method: "POST",
      token,
      body: { email },
    }),
};
