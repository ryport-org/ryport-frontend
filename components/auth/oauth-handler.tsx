"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { readOAuthSession } from "@/lib/auth/oauth-session";
import { setRyportTokens, stripOAuthQueryParams } from "@/lib/auth/tokens";

const APP_DASHBOARD = "/app/dashboard";

function OAuthHandlerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadSessionAfterOAuth, exchangeOAuthCode } = useAuth();
  const handling = useRef(false);

  useEffect(() => {
    if (handling.current) return;

    const oauth = searchParams.get("oauth");
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const code = searchParams.get("code");
    const urlState = searchParams.get("state");
    const error =
      searchParams.get("error_description") ?? searchParams.get("error");

    const hasOAuthParams =
      (oauth === "success" && Boolean(access)) || Boolean(code) || Boolean(error);

    if (!hasOAuthParams) return;

    handling.current = true;

    void (async () => {
      try {
        if (error && oauth !== "success") {
          router.replace(`/login?error=${encodeURIComponent(error)}`);
          return;
        }

        if (oauth === "success" && access) {
          if (!refresh) {
            router.replace("/login?error=missing_refresh_token");
            return;
          }
          setRyportTokens(access, refresh);
          stripOAuthQueryParams();
          await loadSessionAfterOAuth(access);
          router.replace(APP_DASHBOARD);
          return;
        }

        if (code) {
          const state = urlState ?? readOAuthSession().state;
          if (!state) {
            router.replace("/login?error=missing_oauth_state");
            return;
          }
          stripOAuthQueryParams();
          await exchangeOAuthCode(code, state);
          router.replace(APP_DASHBOARD);
          return;
        }
      } catch {
        router.replace("/login?error=oauth_failed");
      }
    })();
  }, [exchangeOAuthCode, loadSessionAfterOAuth, router, searchParams]);

  return null;
}

export function OAuthHandler() {
  return (
    <Suspense fallback={null}>
      <OAuthHandlerInner />
    </Suspense>
  );
}
