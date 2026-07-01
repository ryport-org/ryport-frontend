"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const { finishOAuthCallback } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(true);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    const oauthDescription = searchParams.get("error_description");
    if (oauthError) {
      setError(oauthDescription ?? oauthError);
      setSubmitting(false);
      return;
    }

    finishOAuthCallback()
      .catch((err) => setError(getAuthErrorMessage(err)))
      .finally(() => setSubmitting(false));
  }, [searchParams, finishOAuthCallback]);

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
      <p className="mt-4 text-sm text-mist">
        {submitting ? "Completing sign in…" : "Redirecting…"}
      </p>
    </div>
  );
}
