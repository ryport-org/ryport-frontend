export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ryport.onrender.com";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (typeof window !== "undefined" ? window.location.origin : "https://www.ryport.com.ng");

/** Where Supabase/oauth provider redirects after sign-in. Must match backend allowlist. */
export const OAUTH_CALLBACK_URL =
  process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL ?? `${APP_URL}/auth/callback`;

export const MONO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? "";

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
