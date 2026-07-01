import { apiRequest } from "@/lib/api/client";
import type { TeamInvite } from "@/lib/api/types";

export async function previewInvite(token: string | null, inviteToken: string) {
  return apiRequest<Record<string, unknown>>(`/teams/invites/${inviteToken}/`, {
    token: token ?? undefined,
    skipAuth: !token,
  });
}

export async function acceptInvite(token: string, inviteToken: string) {
  return apiRequest<Record<string, unknown>>("/teams/invites/accept/", {
    method: "POST",
    body: { token: inviteToken },
    token,
  });
}

export async function listInvites(token: string, businessId: string) {
  return apiRequest<TeamInvite[]>(
    `/teams/businesses/${businessId}/invites/`,
    { token },
  );
}

export async function revokeInvite(
  token: string,
  businessId: string,
  inviteId: string,
) {
  return apiRequest<null>(
    `/teams/businesses/${businessId}/invites/${inviteId}/`,
    { method: "DELETE", token },
  );
}
