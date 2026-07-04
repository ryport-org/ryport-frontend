"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStaffAuthErrorMessage, useStaffAuth } from "@/lib/auth/auth-context";

export function LoginForm() {
  const { login } = useStaffAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await login(String(fd.get("email")), String(fd.get("password")));
    } catch (err) {
      setError(getStaffAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-ink">Staff sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Internal access only. Use your Ryport staff credentials.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
            placeholder="you@ryport.com.ng"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export function LoginPageClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useStaffAuth();

  if (!isLoading && isAuthenticated) {
    router.replace("/");
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
