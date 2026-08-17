import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/auth.callback" || pathname.startsWith("/auth.callback/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/auth\.callback/, "/auth/callback");
    return NextResponse.redirect(url);
  }

  const { supabaseResponse, user } = await updateSession(request);

  const hasRyportCookie =
    request.cookies.get("ryport_auth")?.value === "1" ||
    request.cookies.has("ryport_access_token");

  const isAuthenticated = Boolean(user || hasRyportCookie);

  if (pathname === "/") {
    if (isAuthenticated) {
      const dashboard = new URL("/app/dashboard", request.url);
      return NextResponse.redirect(dashboard);
    }
    return supabaseResponse;
  }

  if (pathname.startsWith("/app") || pathname.startsWith("/onboarding")) {
    if (!isAuthenticated) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/app/:path*",
    "/onboarding/:path*",
    "/auth.callback",
    "/auth.callback/:path*",
    "/auth/callback",
  ],
};
