"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/staff/ui/button";
import { Input } from "@/components/staff/ui/input";
import { getStaffAuthErrorMessage, useStaffAuth } from "@/lib/staff/auth/auth-context";
import { staffPath } from "@/lib/staff/routes";

function AcceptInviteFormInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { acceptInvite } = useStaffAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("Invite link is invalid or missing a token.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm_password"));
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await acceptInvite(
        token,
        password,
        String(fd.get("first_name") || undefined),
        String(fd.get("last_name") || undefined),
      );
    } catch (err) {
      setError(getStaffAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-danger">
        This invite link is invalid. Ask your admin to send a new invitation.
      </p>
    );
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-ink">
            First name
          </label>
          <Input id="first_name" name="first_name" className="mt-1.5" />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-ink">
            Last name
          </label>
          <Input id="last_name" name="last_name" className="mt-1.5" />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="mt-1.5"
        />
      </div>
      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium text-ink">
          Confirm password
        </label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          minLength={8}
          required
          className="mt-1.5"
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Accept invite"}
      </Button>
    </form>
  );
}

export function AcceptInvitePageClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useStaffAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(staffPath());
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isLoading && isAuthenticated) return null;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-ink">Accept staff invite</h1>
      <p className="mt-2 text-sm text-muted">Set your password to join the Ryport staff dashboard.</p>
      <Suspense fallback={null}>
        <AcceptInviteFormInner />
      </Suspense>
    </div>
  );
}
