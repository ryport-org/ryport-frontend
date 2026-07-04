import { staffRequest } from "@/lib/staff/api/client";
import { buildQuery } from "@/lib/staff/api/query";
import type { SupportFlaggedUser, SupportNote } from "@/lib/staff/api/types";

export async function getFlaggedUsers(token?: string | null) {
  return staffRequest<SupportFlaggedUser[]>("/support/flagged-users/", { token });
}

export async function listNotes(
  params: { is_flagged?: boolean } = {},
  token?: string | null,
) {
  return staffRequest<SupportNote[]>(`/support/notes/${buildQuery(params)}`, { token });
}
