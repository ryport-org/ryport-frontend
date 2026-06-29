import { apiRequest } from "@/lib/api/client";

export type ApiKey = {
  id: string;
  name?: string;
  prefix: string;
  created_at: string;
};

export const integrationsApi = {
  listApiKeys: (token: string) =>
    apiRequest<ApiKey[]>("/integrations/api-keys/", { token }),

  createApiKey: (token: string, name?: string) =>
    apiRequest<ApiKey & { key: string }>("/integrations/api-keys/", {
      method: "POST",
      token,
      body: { name },
    }),

  revokeApiKey: (token: string, keyId: string) =>
    apiRequest<void>(`/integrations/api-keys/${keyId}/`, {
      method: "DELETE",
      token,
    }),

  externalMe: (apiKey: string) =>
    apiRequest<Record<string, unknown>>("/integrations/external/me/", { apiKey }),
};
