function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ryport.onrender.com";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://capsykyrncpdtjudkxeb.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const APP_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://www.ryport.com.ng"),
);

/** Where Supabase/oauth provider redirects after sign-in. Must match Supabase redirect allowlist. */
export const OAUTH_CALLBACK_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL ?? `${APP_URL}/auth/callback`,
);

export const MONO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? "";

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
