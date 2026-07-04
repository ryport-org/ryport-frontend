import { staffRequest } from "@/lib/staff/api/client";
import type { Announcement } from "@/lib/staff/api/types";

export async function listAnnouncements(token?: string | null) {
  return staffRequest<Announcement[]>("/announcements/", { token });
}

export async function getAnnouncement(id: string, token?: string | null) {
  return staffRequest<Announcement>(`/announcements/${id}/`, { token });
}

export async function createAnnouncement(
  body: {
    title: string;
    message: string;
    target_plans: string[];
    send_email: boolean;
    send_in_app: boolean;
  },
  token?: string | null,
) {
  return staffRequest<Announcement>("/announcements/", { method: "POST", body, token });
}

export async function previewAnnouncement(id: string, token?: string | null) {
  return staffRequest<{ preview: string }>(`/announcements/${id}/preview/`, {
    method: "POST",
    token,
  });
}
