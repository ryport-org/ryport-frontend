import { apiRequest } from "@/lib/api/client";
import type { PlanResponse, Profile } from "@/lib/api/types";

export async function getMe(token: string) {
  return apiRequest<Profile>("/users/me/", { token });
}

export async function getPlan(token: string) {
  return apiRequest<PlanResponse>("/users/me/plan/", { token });
}
