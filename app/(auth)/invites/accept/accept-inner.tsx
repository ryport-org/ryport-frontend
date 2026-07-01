"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth, getAuthErrorMessage } from "@/lib/auth/auth-context";
import { teamsApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/tokens";

export default function AcceptInviteInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const token = searchParams.get("token") ?? "";
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    teamsApi.previewInvite(getAccessToken(), token).then(setPreview).catch(() => null);
  }, [token]);

  async function accept() {
    const access = getAccessToken();
    if (!access) {
      router.push(`/login?next=/invites/accept?token=${token}`);
      return;
    }
    setLoading(true);
    try {
      await teamsApi.acceptInvite(access, token);
      router.push("/app/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <Card className="w-full max-w-md">
        <CardBody className="text-center">
          <h1 className="font-display text-2xl text-ink">Team invitation</h1>
          {preview ? (
            <p className="mt-2 text-sm text-mist">You&apos;ve been invited to join a business on Ryport.</p>
          ) : (
            <p className="mt-2 text-sm text-mist">Loading invitation…</p>
          )}
          {error ? <p className="mt-3 text-sm text-coral-warn">{error}</p> : null}
          <div className="mt-6 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button onClick={accept} disabled={loading || !token}>
                {loading ? "Accepting…" : "Accept invitation"}
              </Button>
            ) : (
              <Button href={`/login?next=/invites/accept?token=${token}`}>Sign in to accept</Button>
            )}
            <Link href="/" className="text-sm text-sky hover:underline">Back to home</Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
