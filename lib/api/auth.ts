import { apiRequest } from "@/lib/api/client";
import type { TwoFactorSetup } from "@/lib/api/types";

export async function requestOtp(email: string) {
  return apiRequest<{ message: string }>("/users/auth/otp/request/", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export async function verifyOtp(email: string, otp: string) {
  return apiRequest<{ message: string }>("/users/auth/otp/verify/", {
    method: "POST",
    body: { email, otp },
    skipAuth: true,
  });
}

export async function enable2fa(token: string) {
  return apiRequest<TwoFactorSetup>("/users/auth/2fa/enable/", {
    method: "POST",
    token,
  });
}

export async function confirm2fa(token: string, totpToken: string) {
  return apiRequest<{ message: string }>("/users/auth/2fa/confirm/", {
    method: "POST",
    body: { token: totpToken },
    token,
  });
}

export async function disable2fa(token: string, totpToken: string) {
  return apiRequest<{ message: string }>("/users/auth/2fa/disable/", {
    method: "POST",
    body: { token: totpToken },
    token,
  });
}

export async function getBackupCodes(token: string) {
  return apiRequest<{ codes: string[] }>("/users/auth/2fa/backup-codes/", {
    token,
  });
}

export async function regenerateBackupCodes(token: string, totpToken: string) {
  return apiRequest<{ codes: string[] }>(
    "/users/auth/2fa/backup-codes/regenerate/",
    { method: "POST", body: { token: totpToken }, token },
  );
}
