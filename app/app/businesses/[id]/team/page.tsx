"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi, teamsApi } from "@/lib/api";
import type { TeamInvite, TeamMember } from "@/lib/api/types";
import { StaffPayslipModal } from "@/components/staff/staff-payslip-modal";

export default function BusinessTeamPage() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  // Payslip modal state
  const [payslipMember, setPayslipMember] = useState<TeamMember | null>(null);

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
      <AppHeader title="Team" description="Members, pending invites, and statutory staff payslips" />

      <AppPageBody>
        <AppPageContent>
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
                      <li key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-ink">{m.name || m.email}</span>
                          {m.name && <span className="text-xs text-mist">{m.email}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="capitalize text-xs text-mist font-medium bg-paper px-2 py-0.5 rounded-md border border-line">
                            {m.role}
                          </span>
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-2.5 h-8 flex items-center gap-1"
                            onClick={() => setPayslipMember(m)}
                          >
                            <FileText className="size-3.5 text-sky" /> View Payslip
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-sm font-semibold text-ink">Pending invites</h2>
                  <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
                    {invites.length === 0 ? (
                      <li className="px-5 py-3 text-xs text-mist">No pending invitations.</li>
                    ) : (
                      invites.map((inv) => (
                        <li key={inv.id} className="flex justify-between items-center px-5 py-3 text-sm">
                          <span>{inv.email}</span>
                          <Button
                            variant="ghost"
                            className="text-coral-warn text-xs"
                            onClick={() => revoke(inv.id)}
                          >
                            Revoke
                          </Button>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              </>
            )}

            <Button variant="ghost" href={`/app/businesses/${id}`}>
              Back
            </Button>
          </PlanGate>

          {/* Payslip Modal */}
          {payslipMember && id && (
            <StaffPayslipModal
              businessId={id}
              staffId={payslipMember.id}
              staffName={payslipMember.name || payslipMember.email}
              isOpen={Boolean(payslipMember)}
              onClose={() => setPayslipMember(null)}
            />
          )}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
