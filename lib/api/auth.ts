import { apiRequest } from "@/lib/api/client";
import type {
  AuthResponse,
  AuthTokens,
  OAuthProvider,
  OAuthStart,
  TwoFactorSetup,
} from "@/lib/api/types";

export async function register(body: {
  email: string;
  password: string;
  password_confirm: string;
}) {
  return apiRequest<AuthResponse>("/users/auth/register/", {
    method: "POST",
    body,
    skipAuth: true,
  });
}

export async function login(body: {
  email: string;
  password: string;
  totp_token?: string;
}) {
  const payload: { email: string; password: string; totp_token?: string } = {
    email: body.email.trim(),
    password: body.password,
  };
  const totp = body.totp_token?.trim();
  if (totp) payload.totp_token = totp;

  return apiRequest<AuthResponse>("/users/auth/login/", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
}

export async function requestOtp(email: string) {
  return apiRequest<{ message: string }>("/users/auth/otp/request/", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export async function verifyOtp(email: string, otp: string) {
  return apiRequest<AuthResponse>("/users/auth/otp/verify/", {
    method: "POST",
    body: { email, otp },
    skipAuth: true,
  });
}

export async function refreshToken(refresh: string) {
  return apiRequest<AuthTokens>("/users/auth/refresh/", {
    method: "POST",
    body: { refresh },
    skipAuth: true,
    skipRefresh: true,
  });
}

export async function logout(refresh: string, token: string) {
  return apiRequest<null>("/users/auth/logout/", {
    method: "POST",
    body: { refresh },
    token,
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

export async function listOAuthProviders() {
  return apiRequest<OAuthProvider[]>("/users/auth/oauth/", { skipAuth: true });
}

export async function startOAuth(provider: "google" | "github", next = "/dashboard") {
  const params = new URLSearchParams({ next });
  return apiRequest<OAuthStart>(`/users/auth/oauth/${provider}/?${params}`, {
    skipAuth: true,
  });
}

export async function completeOAuth(body: {
  code: string;
  state: string;
  totp_token?: string;
}) {
  return apiRequest<AuthResponse>("/users/auth/oauth/callback/", {
    method: "POST",
    body,
    skipAuth: true,
  });
}

/** Validate OAuth tokens from redirect URL and return canonical Ryport JWTs. */
export async function syncSession(access: string) {
  return apiRequest<AuthResponse>("/users/auth/session/sync/", {
    method: "POST",
    body: { access },
    token: access,
    skipAuth: true,
  });
}
