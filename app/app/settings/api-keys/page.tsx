"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokens";
import { integrationsApi } from "@/lib/api";
import type { ApiKey } from "@/lib/api/integrations";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function ApiKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setApiKeys(await integrationsApi.listApiKeys(token));
  };

  useEffect(() => {
    load();
  }, []);

  async function createKey() {
    const token = getAccessToken();
    if (!token) return;
    setError("");
    try {
      const key = await integrationsApi.createApiKey(token, "Default");
      setNewKey(key.key ?? null);
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function revokeKey(id: string) {
    const token = getAccessToken();
    if (!token) return;
    await integrationsApi.revokeApiKey(token, id);
    await load();
  }

  return (
    <>
      <AppHeader title="API keys" description="Programmatic access to Ryport" />
      <div className="p-6 sm:p-8">
        <PlanGate feature="api_access">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Your keys</h2>
              <Button variant="secondary" onClick={createKey}>Create key</Button>
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
                      <p className="text-sm font-medium text-ink">{k.name}</p>
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
        </PlanGate>
      </div>
    </>
  );
}
