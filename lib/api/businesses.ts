import { apiRequest } from "@/lib/api/client";
import type { Business, TeamMember } from "@/lib/api/types";

export async function listBusinesses(token: string) {
  return apiRequest<Business[]>("/businesses/", { token });
}

export async function createBusiness(
  token: string,
  body: { name: string; type: string; currency?: string },
) {
  return apiRequest<Business>("/businesses/", { method: "POST", body, token });
}

export async function getActiveBusiness(token: string) {
  return apiRequest<Business | null>("/businesses/active/", { token });
}

export async function getBusiness(token: string, id: string) {
  return apiRequest<Business>(`/businesses/${id}/`, { token });
}

export async function switchBusiness(token: string, id: string) {
  return apiRequest<Business>(`/businesses/${id}/switch/`, {
    method: "POST",
    token,
  });
}

export async function getBusinessAnalytics(
  token: string,
  id: string,
  days = 90,
) {
  return apiRequest<Record<string, unknown>>(
    `/businesses/${id}/analytics/?days=${days}`,
    { token },
  );
}

export async function listMembers(token: string, businessId: string) {
  return apiRequest<TeamMember[]>(`/businesses/${businessId}/members/`, {
    token,
  });
}

export async function inviteMember(
  token: string,
  businessId: string,
  body: { email: string; role: string },
) {
  return apiRequest<TeamMember>(`/businesses/${businessId}/members/`, {
    method: "POST",
    body,
    token,
  });
}
