import { staffRequest } from "@/lib/staff/api/client";
import { buildQuery } from "@/lib/staff/api/query";
import type { Paginated, StaffInvite, StaffMember, StaffRole } from "@/lib/staff/api/types";

export async function listStaff(
  params: { role?: StaffRole; is_active?: boolean; page?: number } = {},
  token?: string | null,
) {
  return staffRequest<Paginated<StaffMember>>(`/staff${buildQuery(params)}`, { token });
}

export async function inviteStaff(
  body: { email: string; role: StaffRole; department?: string },
  token?: string | null,
) {
  return staffRequest<StaffInvite>("/staff/invite/", { method: "POST", body, token });
}

export async function listInvites(token?: string | null) {
  return staffRequest<StaffInvite[]>("/staff/invites/", { token });
}

export async function revokeInvite(inviteId: string, token?: string | null) {
  return staffRequest<void>(`/staff/invites/${inviteId}/`, { method: "DELETE", token });
}

export async function getStaffMember(staffId: string, token?: string | null) {
  return staffRequest<StaffMember>(`/staff/${staffId}/`, { token });
}

export async function updateStaffMember(
  staffId: string,
  body: { role?: StaffRole; department?: string },
  token?: string | null,
) {
  return staffRequest<StaffMember>(`/staff/${staffId}/`, { method: "PATCH", body, token });
}

export async function deactivateStaff(staffId: string, token?: string | null) {
  return staffRequest<void>(`/staff/${staffId}/deactivate/`, { method: "POST", token });
}

export async function reactivateStaff(staffId: string, token?: string | null) {
  return staffRequest<void>(`/staff/${staffId}/reactivate/`, { method: "POST", token });
}

export async function resetStaffPassword(staffId: string, token?: string | null) {
  return staffRequest<void>(`/staff/${staffId}/reset-password/`, { method: "POST", token });
}
