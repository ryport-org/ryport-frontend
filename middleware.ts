import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase/Vercel typo: auth.callback → auth/callback (preserve ?code=...)
  if (pathname === "/auth.callback" || pathname.startsWith("/auth.callback/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/auth\.callback/, "/auth/callback");
    return NextResponse.redirect(url);
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (pathname.startsWith("/app") && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/app/:path*",
    "/auth.callback",
    "/auth.callback/:path*",
    "/auth/callback",
  ],
};
