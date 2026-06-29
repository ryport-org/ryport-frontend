import { apiRequest } from "@/lib/api/client";
import type { Notification } from "@/lib/api/types";

export const notificationsApi = {
  list: (token: string, filters?: { unread?: boolean; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.unread) params.set("unread", "true");
    if (filters?.type) params.set("type", filters.type);
    const qs = params.toString();
    return apiRequest<Notification[]>(
      `/notifications/${qs ? `?${qs}` : ""}`,
      { token },
    );
  },

  unreadCount: (token: string) =>
    apiRequest<{ count: number }>("/notifications/unread-count/", { token }),

  readAll: (token: string) =>
    apiRequest<void>("/notifications/read-all/", { method: "POST", token }),

  get: (token: string, id: string) =>
    apiRequest<Notification>(`/notifications/${id}/`, { token }),

  markRead: (token: string, id: string) =>
    apiRequest<void>(`/notifications/${id}/read/`, { method: "POST", token }),
};
