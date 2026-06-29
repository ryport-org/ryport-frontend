"use client";

import { useEffect, useState } from "react";
import { AppHeader, PlanBadge } from "@/components/dashboard/app-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { integrationsApi } from "@/lib/api";
import type { ApiKey } from "@/lib/api/integrations";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function SettingsPage() {
  const { user, plan, logout } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isAdvanced = plan?.tier === "advanced";

  useEffect(() => {
    if (!isAdvanced) return;
    const token = getAccessToken();
    if (!token) return;
    integrationsApi.listApiKeys(token).then(setApiKeys).catch(() => []);
  }, [isAdvanced]);

  async function createKey() {
    const token = getAccessToken();
    if (!token) return;
    setError("");
    try {
      const key = await integrationsApi.createApiKey(token, "Default");
      setNewKey(key.key);
      setApiKeys(await integrationsApi.listApiKeys(token));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function revokeKey(id: string) {
    const token = getAccessToken();
    if (!token) return;
    await integrationsApi.revokeApiKey(token, id);
    setApiKeys(await integrationsApi.listApiKeys(token));
  }

  return (
    <>
      <AppHeader title="Settings" description="Profile, plan, and API access" />

      <div className="space-y-6 p-6 sm:p-8">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-ink">Profile</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-xs text-mist">Name</p>
              <p className="text-sm font-medium text-ink">{user?.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-mist">Email</p>
              <p className="text-sm font-medium text-ink">{user?.email}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Subscription</h2>
            <PlanBadge />
          </CardHeader>
          <CardBody>
            {plan ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-mist">Limits</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink">
                    {Object.entries(plan.limits).map(([k, v]) => (
                      <li key={k} className="flex justify-between gap-4">
                        <span className="capitalize text-mist">{k.replace(/_/g, " ")}</span>
                        <span>{v == null ? "∞" : v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-mist">Usage</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink">
                    {Object.entries(plan.usage).map(([k, v]) => (
                      <li key={k} className="flex justify-between gap-4">
                        <span className="capitalize text-mist">{k.replace(/_/g, " ")}</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
            <Button href="/pricing" variant="secondary" className="mt-4">
              Upgrade plan
            </Button>
          </CardBody>
        </Card>

        {isAdvanced ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">API keys</h2>
              <Button variant="secondary" onClick={createKey}>
                Create key
              </Button>
            </CardHeader>
            <CardBody>
              {newKey ? (
                <div className="mb-4 rounded-lg border border-sky/30 bg-sky-soft p-4">
                  <p className="text-xs font-medium text-sky">Copy now — shown once</p>
                  <code className="mt-2 block break-all text-sm text-ink">{newKey}</code>
                </div>
              ) : null}
              {error ? <p className="mb-3 text-sm text-coral-warn">{error}</p> : null}
              <ul className="space-y-2">
                {apiKeys.map((k) => (
                  <li
                    key={k.id}
                    className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{k.name ?? "API key"}</p>
                      <p className="font-mono text-xs text-mist">{k.prefix}…</p>
                    </div>
                    <Button variant="ghost" className="text-coral-warn" onClick={() => revokeKey(k.id)}>
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ) : (
          <Card className="p-6">
            <Badge variant="ink">Advanced</Badge>
            <p className="mt-2 text-sm text-mist">
              API keys are available on the Advanced plan.
            </p>
          </Card>
        )}

        <Button variant="ghost" className="text-coral-warn" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </>
  );
}
