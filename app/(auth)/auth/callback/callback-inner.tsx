"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, getAuthErrorMessage } from "@/lib/auth/auth-context";
import { clearOAuthSession, validateOAuthState } from "@/lib/auth/oauth-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";

export default function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const { completeOAuth } = useAuth();
  const [error, setError] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [totp, setTotp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthParams, setOauthParams] = useState<{ code: string; state: string } | null>(
    null,
  );

  useEffect(() => {
    const oauthError = searchParams.get("error");
    const oauthDescription = searchParams.get("error_description");
    if (oauthError) {
      clearOAuthSession();
      setError(oauthDescription ?? oauthError);
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Missing OAuth parameters. Please try signing in again.");
      return;
    }

    if (!validateOAuthState(state)) {
      clearOAuthSession();
      setError("OAuth session expired or invalid. Please try again.");
      return;
    }

    setOauthParams({ code, state });
    setSubmitting(true);

    completeOAuth(code, state)
      .catch((err) => {
        if (err instanceof ApiError && err.code === "two_factor_required") {
          setNeeds2fa(true);
          setError("");
          return;
        }
        setError(getAuthErrorMessage(err));
      })
      .finally(() => setSubmitting(false));
  }, [searchParams, completeOAuth]);

  async function submit2fa(e: React.FormEvent) {
    e.preventDefault();
    if (!oauthParams || !totp.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await completeOAuth(oauthParams.code, oauthParams.state, totp.trim());
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (needs2fa && oauthParams) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-ink">Two-factor authentication</h1>
          <p className="mt-2 text-sm text-mist">
            Enter the 6-digit code from your authenticator app to finish signing in.
          </p>
          <form onSubmit={submit2fa} className="mt-6 space-y-4">
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
        <p className="text-sm text-coral-warn">{error}</p>
        <Link href="/login" className="mt-4 text-sm font-semibold text-sky hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper">
      <div className="size-8 animate-spin rounded-full border-2 border-line border-t-sky" />
      <p className="mt-4 text-sm text-mist">Completing sign in…</p>
    </div>
  );
}
