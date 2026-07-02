"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
  OAUTH_CALLBACK_URL,
} from "@/lib/config";

export async function startOAuthAction(provider: "google" | "github") {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!isSupabaseConfigured(url, anonKey)) {
    throw new Error(
      "OAuth is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (dev) or Vercel environment variables (prod), then restart dev server or redeploy.",
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: OAUTH_CALLBACK_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("OAuth redirect URL was not returned.");

  redirect(data.url);
}
