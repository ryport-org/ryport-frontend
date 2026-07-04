import { staffRequest } from "@/lib/api/client";
import type {
  StaffAuthResponse,
  StaffRefreshResponse,
  StaffUser,
} from "@/lib/api/types";

export async function login(email: string, password: string) {
  return staffRequest<StaffAuthResponse>("/auth/login/", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

export async function refresh(refreshToken: string) {
  return staffRequest<StaffRefreshResponse>("/auth/refresh/", {
    method: "POST",
    body: { refresh: refreshToken },
    skipAuth: true,
  });
}

export async function logout(refresh: string, token?: string | null) {
  return staffRequest<void>("/auth/logout/", {
    method: "POST",
    body: { refresh },
    token,
  });
}

export async function me(token?: string | null) {
  return staffRequest<StaffUser>("/auth/me/", { token });
}

export async function updateMe(body: { department?: string }, token?: string | null) {
  return staffRequest<StaffUser>("/auth/me/", {
    method: "PATCH",
    body,
    token,
  });
}

export async function changePassword(
  body: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  },
  token?: string | null,
) {
  return staffRequest<void>("/auth/change-password/", {
    method: "POST",
    body,
    token,
  });
}

export async function acceptInvite(body: {
  token: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  return staffRequest<StaffAuthResponse>("/staff/accept-invite/", {
    method: "POST",
    body,
    skipAuth: true,
  });
}
