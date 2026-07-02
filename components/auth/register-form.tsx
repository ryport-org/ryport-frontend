"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
// OAuth temporarily disabled — re-enable: import { SocialLogins } from "@/components/auth/social-logins";
import { getAuthErrorMessage, useAuth } from "@/lib/auth/auth-context";

export function RegisterForm() {
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("password_confirm"));
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(String(fd.get("email")), password, confirm);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-mist">
        Start free — track revenue, monitor cash flow, and get AI guidance in minutes.
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

        <PasswordField id="password" autoComplete="new-password" label="Password" />

        <PasswordField
          id="password_confirm"
          name="password_confirm"
          autoComplete="new-password"
          label="Confirm password"
        />

        {error ? <p className="text-sm text-coral-warn">{error}</p> : null}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {/* OAuth temporarily disabled — <SocialLogins /> */}

      <p className="mt-6 text-center text-sm text-mist">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-sky hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
