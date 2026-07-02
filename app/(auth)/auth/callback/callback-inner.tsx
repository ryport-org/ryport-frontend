"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, getAuthErrorMessage } from "@/lib/auth/auth-context";
import { clearOAuthSession, validateOAuthState } from "@/lib/auth/oauth-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";

function decodeParam(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, " "));
}

function stripSensitiveQueryParams() {
  window.history.replaceState({}, "", "/auth/callback");
}

export default function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const { completeOAuth, completeOAuthFromRedirect } = useAuth();
  const [error, setError] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [totp, setTotp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthParams, setOauthParams] = useState<{ code: string; state: string } | null>(
    null,
  );
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const oauthStatus = searchParams.get("oauth");
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const oauthError =
      searchParams.get("error_description") ?? searchParams.get("error");
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (oauthError && oauthStatus !== "success") {
      handled.current = true;
      setError(decodeParam(oauthError));
      stripSensitiveQueryParams();
      return;
    }

    if (oauthStatus === "success") {
      if (!access) {
        handled.current = true;
        setError("OAuth succeeded but no access token was returned. Please try again.");
        stripSensitiveQueryParams();
        return;
      }

      handled.current = true;
      void (async () => {
        setSubmitting(true);
        try {
          await completeOAuthFromRedirect(access, refresh);
          stripSensitiveQueryParams();
        } catch (err) {
          setError(getAuthErrorMessage(err));
          stripSensitiveQueryParams();
        } finally {
          setSubmitting(false);
        }
      })();
      return;
    }

    if (access && !code) {
      handled.current = true;
      void (async () => {
        setSubmitting(true);
        try {
          await completeOAuthFromRedirect(access, refresh);
          stripSensitiveQueryParams();
        } catch (err) {
          setError(getAuthErrorMessage(err));
          stripSensitiveQueryParams();
        } finally {
          setSubmitting(false);
        }
      })();
      return;
    }

    if (!code || !state) {
      handled.current = true;
      setError("Missing OAuth parameters. Please try signing in again.");
      return;
    }

    if (!validateOAuthState(state)) {
      handled.current = true;
      clearOAuthSession();
      setError("OAuth session expired or invalid. Please try signing in again.");
      return;
    }

    setOauthParams({ code, state });
    handled.current = true;

    void (async () => {
      setSubmitting(true);
      try {
        await completeOAuth(code, state);
        stripSensitiveQueryParams();
      } catch (err) {
        if (err instanceof ApiError && err.code === "2fa_required") {
          setNeeds2fa(true);
          setError("");
        } else {
          setError(getAuthErrorMessage(err));
        }
      } finally {
        setSubmitting(false);
      }
    })();
  }, [completeOAuth, completeOAuthFromRedirect, searchParams]);

  async function handle2faSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oauthParams) return;
    setSubmitting(true);
    setError("");
    try {
      await completeOAuth(oauthParams.code, oauthParams.state, totp.trim());
      stripSensitiveQueryParams();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (needs2fa) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-ink">Two-factor authentication</h1>
          <p className="mt-2 text-sm text-mist">
            Enter the code from your authenticator app to finish signing in.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handle2faSubmit}>
            <Input
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              required
            />
            {error ? <p className="text-sm text-coral-warn">{error}</p> : null}
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Verifying…" : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
        <h1 className="font-display text-2xl text-ink">Sign-in failed</h1>
        <p className="mt-3 max-w-md text-sm text-coral-warn">{error}</p>
        <Link
          href="/login"
          className="mt-6 text-sm font-medium text-sky hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-sky" />
        <p className="text-sm text-mist">Completing sign-in…</p>
      </div>
    </div>
  );
}
