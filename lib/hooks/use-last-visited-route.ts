"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const LAST_VISITED_KEY = "ryport_last_visited_route";

export function useLastVisitedRoute() {
  const pathname = usePathname();
  const router = useRouter();
  const hasRestored = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!pathname || !pathname.startsWith("/app")) return;

    // Check if landing on dashboard and attempt restoration
    if (pathname === "/app/dashboard" && !hasRestored.current) {
      hasRestored.current = true;
      const storedRoute = localStorage.getItem(LAST_VISITED_KEY);
      if (
        storedRoute &&
        storedRoute.startsWith("/app") &&
        storedRoute !== "/app/dashboard" &&
        !storedRoute.includes("/login")
      ) {
        router.replace(storedRoute);
        return;
      }
    }

    // Save current valid /app route
    if (pathname.startsWith("/app")) {
      localStorage.setItem(LAST_VISITED_KEY, pathname);
    }
  }, [pathname, router]);
}
