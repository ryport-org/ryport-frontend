import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSession } from "@/lib/supabase/middleware";

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

  if (!code) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "missing_oauth_code");
    return NextResponse.redirect(login);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", error.message);
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(new URL("/app/dashboard", origin));
}
