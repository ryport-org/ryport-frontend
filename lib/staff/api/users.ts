import { staffRequest } from "@/lib/staff/api/client";
import { buildQuery } from "@/lib/staff/api/query";
import type {
  CustomerUserDetail,
  CustomerUserListItem,
  Paginated,
  UserNote,
} from "@/lib/staff/api/types";

export type UserListParams = {
  plan?: string;
  is_suspended?: boolean;
  has_bank_account?: boolean;
  date_from?: string;
  date_to?: string;
  q?: string;
  sort?: "signup_date" | "last_active" | "plan";
  page?: number;
};

export async function listUsers(params: UserListParams = {}, token?: string | null) {
  return staffRequest<Paginated<CustomerUserListItem>>(`/users/${buildQuery(params)}`, { token });
}

export async function getUser(userId: string, token?: string | null) {
  return staffRequest<CustomerUserDetail>(`/users/${userId}/`, { token });
}

export async function suspendUser(userId: string, token?: string | null) {
  return staffRequest<void>(`/users/${userId}/suspend/`, { method: "POST", token });
}

export async function unsuspendUser(userId: string, token?: string | null) {
  return staffRequest<void>(`/users/${userId}/unsuspend/`, { method: "POST", token });
}

export async function resetUserPassword(userId: string, token?: string | null) {
  return staffRequest<void>(`/users/${userId}/reset-password/`, { method: "POST", token });
}

export async function changeUserPlan(
  userId: string,
  plan: string,
  token?: string | null,
) {
  return staffRequest<void>(`/users/${userId}/change-plan/`, {
    method: "PATCH",
    body: { plan },
    token,
  });
}

export async function listUserNotes(userId: string, token?: string | null) {
  return staffRequest<UserNote[]>(`/users/${userId}/notes/`, { token });
}

export async function addUserNote(
  userId: string,
  body: string,
  token?: string | null,
) {
  return staffRequest<UserNote>(`/users/${userId}/notes/`, {
    method: "POST",
    body: { body },
    token,
  });
}

export async function deleteUserNote(
  userId: string,
  noteId: string,
  token?: string | null,
) {
  return staffRequest<void>(`/users/${userId}/notes/${noteId}/`, {
    method: "DELETE",
    token,
  });
}

export async function exportUsers(
  params: { date_from?: string; date_to?: string } = {},
  token?: string | null,
) {
  return staffRequest<Blob>(`/users/export/${buildQuery(params)}`, { token });
}
