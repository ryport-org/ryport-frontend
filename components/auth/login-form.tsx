"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { SocialLogins } from "@/components/auth/social-logins";
import { getAuthErrorMessage, useAuth } from "@/lib/auth/auth-context";

export function LoginForm() {
  const { login, loginWithOtp, requestOtp } = useAuth();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    setLoading(true);
    setError("");
    try {
      if (mode === "otp") {
        const otp = String(fd.get("otp") || "");
        if (!otpSent) {
          await requestOtp(email);
          setOtpSent(true);
        } else {
          await loginWithOtp(email, otp);
        }
      } else {
        await login(
          email,
          String(fd.get("password")),
          String(fd.get("totp") || undefined) || undefined,
        );
      }
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

      <div className="mt-6 flex gap-2 rounded-lg border border-line bg-paper p-1">
        <button
          type="button"
          onClick={() => { setMode("password"); setOtpSent(false); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === "password" ? "bg-white text-ink shadow-sm" : "text-mist"}`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => { setMode("otp"); setOtpSent(false); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === "otp" ? "bg-white text-ink shadow-sm" : "text-mist"}`}
        >
          Email code
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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

        {mode === "password" ? (
          <>
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
          </>
        ) : otpSent ? (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-ink">
              Verification code
            </label>
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              required
              className="mt-1.5"
              placeholder="123456"
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          {mode === "password" ? (
            <Link href="/reset-password" className="text-sm font-medium text-sky hover:underline">
              Forgot your password?
            </Link>
          ) : (
            <span />
          )}
        </div>

        {error ? <p className="text-sm text-coral-warn">{error}</p> : null}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "otp"
              ? otpSent
                ? "Verify code"
                : "Send code"
              : "Log in"}
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
