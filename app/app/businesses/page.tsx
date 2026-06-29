"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi } from "@/lib/api";
import type { Business } from "@/lib/api/types";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function BusinessesPage() {
  const { plan } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [active, setActive] = useState<Business | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const isAdvanced = plan?.tier === "advanced";

  useEffect(() => {
    if (!isAdvanced) return;
    const token = getAccessToken();
    if (!token) return;
    Promise.all([
      businessesApi.list(token),
      businessesApi.active(token).catch(() => null),
    ]).then(([list, act]) => {
      setBusinesses(list);
      setActive(act);
    });
  }, [isAdvanced]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    setError("");
    try {
      await businessesApi.create(token, { name });
      setName("");
      const list = await businessesApi.list(token);
      setBusinesses(list);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function switchBusiness(id: string) {
    const token = getAccessToken();
    if (!token) return;
    await businessesApi.switch(token, id);
    const act = await businessesApi.active(token);
    setActive(act);
  }

  if (!isAdvanced) {
    return (
      <>
        <AppHeader title="Businesses" description="Multi-business management" />
        <div className="p-8">
          <Card className="p-12 text-center">
            <Badge variant="ink" className="mb-4">Advanced</Badge>
            <p className="text-sm text-mist">
              Upgrade to Advanced to manage multiple businesses and invite your team.
            </p>
            <Button href="/pricing" className="mt-4">
              View plans
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Businesses"
        description="Manage multiple businesses and switch context"
      />

      <div className="space-y-6 p-6 sm:p-8">
        {active ? (
          <Card className="border-sky/30 bg-sky-soft/30 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-sky">Active</p>
            <p className="mt-1 text-lg font-semibold text-ink">{active.name}</p>
          </Card>
        ) : null}

        <Card className="p-6">
          <form onSubmit={create} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Business name"
              required
              className="flex-1"
            />
            <Button type="submit">Create business</Button>
          </form>
          {error ? <p className="mt-2 text-sm text-coral-warn">{error}</p> : null}
        </Card>

        <ul className="grid gap-3 sm:grid-cols-2">
          {businesses.map((b) => (
            <Card key={b.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{b.name}</p>
                  {b.industry ? <p className="text-xs text-mist">{b.industry}</p> : null}
                </div>
                {active?.id !== b.id ? (
                  <Button variant="secondary" className="text-xs" onClick={() => switchBusiness(b.id)}>
                    Switch
                  </Button>
                ) : (
                  <Badge variant="sky">Active</Badge>
                )}
              </CardBody>
            </Card>
          ))}
        </ul>
      </div>
    </>
  );
}
