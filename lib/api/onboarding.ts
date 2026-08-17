import { apiRequest } from "@/lib/api/client";
import type { DashboardContext, UserSegment } from "@/lib/api/types";

export async function updateSegment(token: string, segment: UserSegment) {
  return apiRequest<{ segment: UserSegment }>("/users/me/segment/", {
    method: "PATCH",
    body: { segment },
    token,
  });
}

export async function getDashboardContext(token: string) {
  return apiRequest<DashboardContext>("/users/me/dashboard-context/", {
    token,
  });
}
