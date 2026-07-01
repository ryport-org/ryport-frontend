import { apiRequest } from "@/lib/api/client";

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  key?: string;
};

export async function listApiKeys(token: string) {
  return apiRequest<ApiKey[]>("/integrations/api-keys/", { token });
}

export async function createApiKey(token: string, name: string) {
  return apiRequest<ApiKey>("/integrations/api-keys/", {
    method: "POST",
    body: { name },
    token,
  });
}

export async function revokeApiKey(token: string, id: string) {
  return apiRequest<null>(`/integrations/api-keys/${id}/`, {
    method: "DELETE",
    token,
  });
}
