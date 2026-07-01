"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi } from "@/lib/api";
import type { Business } from "@/lib/api/types";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function BusinessesPage() {
  const { activeBusiness } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("services");
  const [error, setError] = useState("");

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setBusinesses(await businessesApi.list(token));
  };

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    setError("");
    try {
      await businessesApi.create(token, { name, type });
      setName("");
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function switchBusiness(id: string) {
    const token = getAccessToken();
    if (!token) return;
    await businessesApi.switch(token, id);
    window.location.reload();
  }

  return (
    <>
      <AppHeader title="Businesses" description="Manage multiple businesses and switch context" />
      <div className="space-y-6 p-6 sm:p-8">
        <PlanGate feature="multi_business">
          {activeBusiness ? (
            <Card className="border-sky/30 bg-sky-soft/30 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-sky">Active</p>
              <p className="mt-1 text-lg font-semibold text-ink">{activeBusiness.name}</p>
            </Card>
          ) : null}

          <Card className="p-6">
            <form onSubmit={create} className="grid gap-3 sm:grid-cols-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Business name"
                required
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputClassName}
              >
                <option value="retail">Retail</option>
                <option value="services">Services</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="technology">Technology</option>
                <option value="hospitality">Hospitality</option>
                <option value="other">Other</option>
              </select>
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
                    <p className="text-xs capitalize text-mist">{b.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" href={`/app/businesses/${b.id}`} className="text-xs">
                      Open
                    </Button>
                    {activeBusiness?.id !== b.id ? (
                      <Button variant="secondary" className="text-xs" onClick={() => switchBusiness(b.id)}>
                        Switch
                      </Button>
                    ) : (
                      <Badge variant="sky">Active</Badge>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </ul>
        </PlanGate>
      </div>
    </>
  );
}
