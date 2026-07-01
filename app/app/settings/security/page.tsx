"use client";

import { useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, getAuthErrorMessage } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { authApi } from "@/lib/api";

export default function SecuritySettingsPage() {
  const { user, refreshSession } = useAuth();
  const [token, setToken] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function start2fa() {
    const access = getAccessToken();
    if (!access) return;
    setLoading(true);
    setError("");
    try {
      const setup = await authApi.enable2fa(access);
      setQrUrl(setup.qr_code_url);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function confirm2fa() {
    const access = getAccessToken();
    if (!access || !token) return;
    setLoading(true);
    try {
      await authApi.confirm2fa(access, token);
      setQrUrl(null);
      setToken("");
      await refreshSession();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function disable2fa() {
    const access = getAccessToken();
    if (!access || !token) return;
    setLoading(true);
    try {
      await authApi.disable2fa(access, token);
      setToken("");
      await refreshSession();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadBackupCodes() {
    const access = getAccessToken();
    if (!access) return;
    const res = await authApi.getBackupCodes(access);
    setBackupCodes(res.codes);
  }

  async function regenerateCodes() {
    const access = getAccessToken();
    if (!access || !token) return;
    const res = await authApi.regenerateBackupCodes(access, token);
    setBackupCodes(res.codes);
  }

  return (
    <>
      <AppHeader title="Security" description="Two-factor authentication" />
      <div className="space-y-6 p-6 sm:p-8">
        <Card>
          <CardBody className="space-y-4">
            <p className="text-sm text-mist">
              2FA is {user?.is_2fa_enabled ? "enabled" : "disabled"} on your account.
            </p>

            {!user?.is_2fa_enabled && !qrUrl ? (
              <Button onClick={start2fa} disabled={loading}>Enable 2FA</Button>
            ) : null}

            {qrUrl ? (
              <div className="space-y-3">
                <p className="text-sm text-mist">Scan this QR code with your authenticator app.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="2FA QR code" className="size-48 rounded-lg border border-line" />
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
                <Button onClick={confirm2fa} disabled={loading || !token}>Confirm 2FA</Button>
              </div>
            ) : null}

            {user?.is_2fa_enabled ? (
              <div className="space-y-3">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="TOTP code to confirm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={disable2fa} disabled={loading || !token}>
                    Disable 2FA
                  </Button>
                  <Button variant="secondary" onClick={loadBackupCodes}>View backup codes</Button>
                  <Button variant="secondary" onClick={regenerateCodes} disabled={!token}>
                    Regenerate codes
                  </Button>
                </div>
              </div>
            ) : null}

            {backupCodes ? (
              <ul className="rounded-lg border border-line bg-paper p-4 font-mono text-sm">
                {backupCodes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : null}

            {error ? <p className="text-sm text-coral-warn">{error}</p> : null}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
