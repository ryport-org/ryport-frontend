function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const raw = process.env[key];
    if (!raw) continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    return trimmed.replace(/^['"]|['"]$/g, "");
  }
  return "";
}

function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeOAuthCallbackUrl(url: string): string {
  const withProtocol = normalizeSiteUrl(url);
  return withProtocol.replace(/auth\.callback/gi, "auth/callback");
}

/** Production marketing + auth origin (always use www). */
export const SITE_URL = "https://www.ryport.com.ng";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ryport.onrender.com";

export const API_V1 = `${API_BASE_URL}/api/v1`;

/** Read at runtime — works on server after Vercel env changes without rebuild. */
export function getSupabaseUrl(): string {
  return (
    readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL") ||
    "https://capsykyrncpdtjudkxeb.supabase.co"
  );
}

/** Read at runtime — works on server after Vercel env changes without rebuild. */
export function getSupabaseAnonKey(): string {
  return readEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  );
}

const PLACEHOLDER_KEYS = new Set(["", "placeholder-anon-key", "your-anon-key", "missing-anon-key"]);

export function isSupabaseConfigured(
  url = getSupabaseUrl(),
  anonKey = getSupabaseAnonKey(),
): boolean {
  return Boolean(url) && Boolean(anonKey) && !PLACEHOLDER_KEYS.has(anonKey);
}

/** @deprecated use getSupabaseUrl() */
export const SUPABASE_URL = getSupabaseUrl();

/** @deprecated use getSupabaseAnonKey() — may be empty in client bundle if not set at build */
export const SUPABASE_ANON_KEY = getSupabaseAnonKey();

export const APP_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL,
);

export const OAUTH_CALLBACK_URL = normalizeOAuthCallbackUrl(
  process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL ?? `${SITE_URL}/auth/callback`,
);

export const MONO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? "";

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
