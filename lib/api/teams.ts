import { apiRequest } from "@/lib/api/client";

export const teamsApi = {
  previewInvite: (token: string, inviteToken: string) =>
    apiRequest<Record<string, unknown>>(`/teams/invites/${inviteToken}/`, {
      token,
    }),

  acceptInvite: (token: string, inviteToken: string) =>
    apiRequest<void>("/teams/invites/accept/", {
      method: "POST",
      token,
      body: { token: inviteToken },
    }),

  listInvites: (token: string, businessId: string) =>
    apiRequest<unknown[]>(`/teams/businesses/${businessId}/invites/`, { token }),

  sendInvite: (
    token: string,
    businessId: string,
    body: { email: string; role: string },
  ) =>
    apiRequest<void>(`/teams/businesses/${businessId}/invites/`, {
      method: "POST",
      token,
      body,
    }),

  revokeInvite: (token: string, businessId: string, inviteId: string) =>
    apiRequest<void>(
      `/teams/businesses/${businessId}/invites/${inviteId}/`,
      { method: "DELETE", token },
    ),
};
