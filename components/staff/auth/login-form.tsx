"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/staff/ui/button";
import { Input } from "@/components/staff/ui/input";
import { getStaffAuthErrorMessage, useStaffAuth } from "@/lib/staff/auth/auth-context";
import { staffPath } from "@/lib/staff/routes";

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
        Staff access only. This login is separate from the customer app at /login — you
        need a staff account created by an admin invite or backend superadmin setup.
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

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(staffPath());
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isLoading && isAuthenticated) return null;

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
