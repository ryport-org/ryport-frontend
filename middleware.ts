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

  // Fast-path: If user has a valid Ryport session cookie, immediately allow through
  // without blocking the request on a remote Supabase network roundtrip
  const hasRyportCookie =
    request.cookies.get("ryport_auth")?.value === "1" ||
    request.cookies.has("ryport_access_token");

  if (hasRyportCookie) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Fallback to checking Supabase session only when Ryport cookie isn't present
  const { supabaseResponse, user } = await updateSession(request);
  const isAuthenticated = Boolean(user);

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
