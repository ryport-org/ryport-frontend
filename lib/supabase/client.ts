import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Allows build/SSR; auth calls fail until env is set in production.
    return createBrowserClient(SUPABASE_URL, "missing-anon-key");
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
