import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/config";

let browserClient: SupabaseClient | null = null;
let resolvedAnonKey: string | null = null;

async function resolveBrowserConfig(): Promise<{ url: string; anonKey: string }> {
  const buildUrl = getSupabaseUrl();
  const buildKey = getSupabaseAnonKey();

  if (isSupabaseConfigured(buildUrl, buildKey)) {
    return { url: buildUrl, anonKey: buildKey };
  }

  const res = await fetch("/api/public-config", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      "OAuth is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local or Vercel, then restart or redeploy.",
    );
  }

  const json = (await res.json()) as { url: string; anonKey: string };
  if (!json.anonKey) {
    throw new Error("Supabase anon key missing on server.");
  }

  return { url: json.url, anonKey: json.anonKey };
}

export async function getSupabaseBrowserClient(): Promise<SupabaseClient> {
  const { url, anonKey } = await resolveBrowserConfig();

  if (browserClient && resolvedAnonKey === anonKey) {
    return browserClient;
  }

  browserClient = createBrowserClient(url, anonKey);
  resolvedAnonKey = anonKey;
  return browserClient;
}

/** Sync client when build-time env is present (e.g. local dev). */
export function createClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (isSupabaseConfigured(url, anonKey)) {
    return createBrowserClient(url, anonKey);
  }

  throw new Error("SUPABASE_NOT_CONFIGURED_AT_BUILD");
}
