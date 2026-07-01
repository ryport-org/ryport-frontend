"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const { completeOAuth } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state") ?? undefined;
    if (!code) {
      setError("Missing OAuth parameters. Please try again.");
      return;
    }
    completeOAuth(code, state).catch((err) => {
      setError(getAuthErrorMessage(err));
    });
  }, [searchParams, completeOAuth]);

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
