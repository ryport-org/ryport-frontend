"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { SocialLogins } from "@/components/auth/social-logins";
import { getAuthErrorMessage, useAuth } from "@/lib/auth/auth-context";

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await login(
        String(fd.get("email")),
        String(fd.get("password")),
        String(fd.get("totp") || undefined) || undefined,
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-mist">
        Enter your email and password to access your account.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5"
            placeholder="you@company.com"
          />
        </div>

        <PasswordField id="password" />

        <div>
          <label htmlFor="totp" className="block text-sm font-medium text-ink">
            2FA code <span className="font-normal text-mist">(if enabled)</span>
          </label>
          <Input
            id="totp"
            name="totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="mt-1.5"
            placeholder="000000"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-line text-sky focus:ring-sky/20"
            />
            Remember me
          </label>
          <Link href="#" className="text-sm font-medium text-sky hover:underline">
            Forgot your password?
          </Link>
        </div>

        {error ? <p className="text-sm text-coral-warn">{error}</p> : null}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <SocialLogins />

      <p className="mt-6 text-center text-sm text-mist">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-sky hover:underline">
          Register now
        </Link>
      </p>
    </div>
  );
}
