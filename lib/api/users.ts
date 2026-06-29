import { apiRequest } from "@/lib/api/client";
import type { User, UserPlan } from "@/lib/api/types";

export const usersApi = {
  me: (token: string) => apiRequest<User>("/users/me/", { token }),

  plan: (token: string) => apiRequest<UserPlan>("/users/me/plan/", { token }),
};
