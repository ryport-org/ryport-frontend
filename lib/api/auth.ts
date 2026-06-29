import { apiRequest } from "@/lib/api/client";
import type { AuthTokens, OAuthProvider, OAuthStart } from "@/lib/api/types";

export type LoginPayload = {
  email: string;
  password: string;
  totp_token?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
};

export type AuthResponse = AuthTokens & {
  user?: { id: string; email: string; full_name?: string };
};

export const authApi = {
  register: (body: RegisterPayload) =>
    apiRequest<AuthResponse>("/users/auth/register/", { method: "POST", body }),

  login: (body: LoginPayload) =>
    apiRequest<AuthResponse>("/users/auth/login/", { method: "POST", body }),

  logout: (refresh: string, token: string) =>
    apiRequest<void>("/users/auth/logout/", {
      method: "POST",
      token,
      body: { refresh },
    }),

  refresh: (refresh: string) =>
    apiRequest<AuthTokens>("/users/auth/refresh/", {
      method: "POST",
      body: { refresh },
    }),

  listOAuthProviders: () =>
    apiRequest<OAuthProvider[]>("/users/auth/oauth/"),

  startOAuth: (provider: "google" | "github", redirectTo: string) =>
    apiRequest<OAuthStart>(
      `/users/auth/oauth/${provider}/?redirect_to=${encodeURIComponent(redirectTo)}`,
    ),

  oauthCallback: (code: string, state: string) =>
    apiRequest<AuthResponse>("/users/auth/oauth/callback/", {
      method: "POST",
      body: { code, state },
    }),
};
