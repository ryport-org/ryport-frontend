"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi, teamsApi } from "@/lib/api";
import type { TeamInvite, TeamMember } from "@/lib/api/types";

export default function BusinessTeamPage() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const load = async () => {
    const token = getAccessToken();
    if (!token || !id) return;
    const [m, i] = await Promise.all([
      businessesApi.members(token, id),
      teamsApi.listInvites(token, id).catch(() => []),
    ]);
    setMembers(m);
    setInvites(i);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !id || !email) return;
    await businessesApi.inviteMember(token, id, { email, role });
    setEmail("");
    await load();
  }

  async function revoke(inviteId: string) {
    const token = getAccessToken();
    if (!token || !id) return;
    await teamsApi.revokeInvite(token, id, inviteId);
    await load();
  }

  return (
    <AppPage>
      <AppHeader title="Team" description="Members and pending invites" />

      <AppPageBody>
      <div className="space-y-6 p-6 sm:p-8">
        <PlanGate feature="team_collaboration">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-ink">Invite member</h2>
            <form onSubmit={invite} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-lg border border-line px-3 text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit">Send invite</Button>
            </form>
          </Card>

          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <>
              <section>
                <h2 className="text-sm font-semibold text-ink">Members</h2>
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
                  {members.map((m) => (
                    <li key={m.id} className="flex justify-between px-5 py-3 text-sm">
                      <span>{m.email}</span>
                      <span className="capitalize text-mist">{m.role}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-sm font-semibold text-ink">Pending invites</h2>
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
                  {invites.map((inv) => (
                    <li key={inv.id} className="flex justify-between px-5 py-3 text-sm">
                      <span>{inv.email}</span>
                      <Button variant="ghost" className="text-coral-warn" onClick={() => revoke(inv.id)}>
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <Button variant="ghost" href={`/app/businesses/${id}`}>Back</Button>
        </PlanGate>
      </div>
          </AppPageBody>
    </AppPage>  );
}
