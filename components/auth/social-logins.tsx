"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getAuthErrorMessage, useAuth } from "@/lib/auth/auth-context";

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.26-.01-2.28-3.34.62-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.11-.76.08-.75.08-.75 1.23.09 1.87 1.26 1.87 1.26 1.09 1.87 2.86 1.33 3.56 1.02.11-.79.43-1.33.78-1.63-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.01 2.05.14 3 .4 2.29-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.69.83.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const PROVIDERS = [
  { id: "google" as const, label: "Google", Icon: GoogleIcon },
  { id: "github" as const, label: "GitHub", Icon: GitHubIcon },
];

export function SocialLogins() {
  const { startOAuth } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  async function handleOAuth(provider: "google" | "github") {
    setLoading(provider);
    setError("");
    try {
      await startOAuth(provider);
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(getAuthErrorMessage(err));
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-line" />
        </div>
        <p className="relative mx-auto w-fit bg-paper px-3 text-xs text-mist">
          Or continue with
        </p>
      </div>

      {error ? <p className="mb-3 text-center text-sm text-coral-warn">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            disabled={loading !== null}
            onClick={() => handleOAuth(id)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white text-sm font-medium text-ink transition-colors hover:border-sky hover:bg-sky-soft disabled:opacity-60"
          >
            <Icon />
            {loading === id ? "Redirecting…" : label}
          </button>
        ))}
      </div>
    </div>
  );
}
