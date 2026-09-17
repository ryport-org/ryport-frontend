import { apiRequest } from "@/lib/api/client";
import type { Notification, PushSubscriptionPayload } from "@/lib/api/types";

export async function listNotifications(
  token: string,
  params?: { unread?: boolean; type?: string },
) {
  const qs = new URLSearchParams();
  if (params?.unread) qs.set("unread", "true");
  if (params?.type) qs.set("type", params.type);
  const query = qs.toString();
  return apiRequest<Notification[]>(
    `/notifications/${query ? `?${query}` : ""}`,
    { token },
  );
}

export async function getUnreadCount(token: string) {
  return apiRequest<{ count: number }>("/notifications/unread-count/", { token });
}

export async function markAllRead(token: string) {
  return apiRequest<null>("/notifications/read-all/", { method: "POST", token });
}

export async function getNotification(token: string, id: string) {
  return apiRequest<Notification>(`/notifications/${id}/`, { token });
}

export async function markRead(token: string, id: string) {
  return apiRequest<null>(`/notifications/${id}/read/`, { method: "POST", token });
}

export async function subscribePush(token: string, payload: PushSubscriptionPayload) {
  return apiRequest<{ success: boolean }>("/notifications/push/subscribe/", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function unsubscribePush(token: string, payload?: { endpoint?: string }) {
  return apiRequest<{ success: boolean }>("/notifications/push/unsubscribe/", {
    method: "POST",
    body: payload ?? {},
    token,
  });
}
