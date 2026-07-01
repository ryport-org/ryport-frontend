import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", oauthError);
    return NextResponse.redirect(login);
  }

  if (!isSupabaseConfigured()) {
    const login = new URL("/login", origin);
    login.searchParams.set(
      "error",
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel and redeploy.",
    );
    return NextResponse.redirect(login);
  }

  if (!code) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "missing_oauth_code");
    return NextResponse.redirect(login);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const login = new URL("/login", origin);
      const message =
        error.message === "Invalid API key"
          ? "Invalid Supabase API key. Check NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel and redeploy."
          : error.message;
      login.searchParams.set("error", message);
      return NextResponse.redirect(login);
    }

    return NextResponse.redirect(new URL("/app/dashboard", origin));
  } catch (err) {
    const login = new URL("/login", origin);
    login.searchParams.set(
      "error",
      err instanceof Error ? err.message : "OAuth sign-in failed",
    );
    return NextResponse.redirect(login);
  }
}
