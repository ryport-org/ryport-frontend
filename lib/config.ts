function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Fix common misconfig: auth.callback (dot) → auth/callback (slash). */
function normalizeOAuthCallbackUrl(url: string): string {
  const withProtocol = normalizeSiteUrl(url);
  return withProtocol.replace(/auth\.callback/gi, "auth/callback");
}

/** Production marketing + auth origin (always use www). */
export const SITE_URL = "https://www.ryport.com.ng";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ryport.onrender.com";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://capsykyrncpdtjudkxeb.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const APP_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL,
);

/**
 * Supabase OAuth redirect — must match Authentication → URL Configuration exactly.
 * Default: https://www.ryport.com.ng/auth/callback
 * Local dev: set NEXT_PUBLIC_OAUTH_CALLBACK_URL=http://localhost:3000/auth/callback
 */
export const OAUTH_CALLBACK_URL = normalizeOAuthCallbackUrl(
  process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL ??
    `${SITE_URL}/auth/callback`,
);

export const MONO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? "";

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
