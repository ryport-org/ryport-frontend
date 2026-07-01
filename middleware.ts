import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase/Vercel typo: auth.callback → auth/callback (preserve ?code=...)
  if (pathname === "/auth.callback" || pathname.startsWith("/auth.callback/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/auth\.callback/, "/auth/callback");
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/app")) {
    const hasAuth =
      request.cookies.get("ryport_auth")?.value === "1" ||
      request.cookies.has("ryport_access_token");

    if (!hasAuth) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth.callback", "/auth.callback/:path*"],
};
