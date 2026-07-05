"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { useStaffFetch } from "@/components/staff/hooks/use-staff-fetch";
import { Badge } from "@/components/staff/ui/badge";
import { Button } from "@/components/staff/ui/button";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import { Input } from "@/components/staff/ui/input";
import { staffManagementApi } from "@/lib/staff/api";
import type { StaffRole } from "@/lib/staff/api/types";
import { getStaffAuthErrorMessage } from "@/lib/staff/auth/auth-context";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";

export default function StaffManagementPage() {
  const staff = useStaffFetch((t) => staffManagementApi.listStaff({}, t), []);
  const invites = useStaffFetch((t) => staffManagementApi.listInvites(t), []);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("support");
  const [department, setDepartment] = useState("");
  const [formError, setFormError] = useState("");

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const token = getStaffAccessToken();
    if (!token) return;
    setFormError("");
    try {
      await staffManagementApi.inviteStaff(
        { email: email.trim(), role, department: department || undefined },
        token,
      );
      setEmail("");
      staff.reload();
      invites.reload();
    } catch (err) {
      setFormError(getStaffAuthErrorMessage(err));
    }
  }

  const error = staff.error || invites.error;

  return (
    <>
      <PageHeader title="Staff" description="Invite and manage internal team members" />
      <PageBody>
        <PermissionGate permission="can_manage_staff">
          {error ? (
            <ApiErrorBanner
              message={error}
              onRetry={() => {
                staff.reload();
                invites.reload();
              }}
            />
          ) : null}

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-sm font-semibold text-ink">Invite staff</h2>
            </CardHeader>
            <CardBody className="pt-0">
              <form
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
                onSubmit={(e) => void invite(e)}
              >
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="min-h-9 rounded-md border border-border bg-bg px-3 text-sm"
                >
                  <option value="support">Support</option>
                  <option value="finance">Finance</option>
                  <option value="engineering">Engineering</option>
                  <option value="superadmin">Superadmin</option>
                </select>
                <Input
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="sm:max-w-[160px]"
                />
                <Button type="submit">Invite</Button>
              </form>
              {formError ? <p className="mt-2 text-sm text-danger">{formError}</p> : null}
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-ink">Team members</h2>
              </CardHeader>
              <CardBody className="pt-0">
                {staff.loading ? (
                  <LoadingGrid count={1} height="h-24" />
                ) : staff.data?.results?.length ? (
                  <ul className="divide-y divide-border">
                    {staff.data.results.map((m) => (
                      <li key={m.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-ink">{m.email}</p>
                          <p className="text-xs capitalize text-muted">
                            {m.role} · {m.department}
                          </p>
                        </div>
                        <Badge variant={m.is_active ? "success" : "danger"}>
                          {m.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No staff listed.</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-ink">Pending invites</h2>
              </CardHeader>
              <CardBody className="pt-0">
                {invites.loading ? (
                  <LoadingGrid count={1} height="h-24" />
                ) : invites.data?.length ? (
                  <ul className="divide-y divide-border">
                    {invites.data.map((inv) => (
                      <li key={inv.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm text-ink">{inv.email}</p>
                          <p className="text-xs capitalize text-muted">{inv.role}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            void (async () => {
                              const t = getStaffAccessToken();
                              if (t) {
                                await staffManagementApi.revokeInvite(inv.id, t);
                                invites.reload();
                              }
                            })()
                          }
                        >
                          Revoke
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No pending invites.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </PermissionGate>
      </PageBody>
    </>
  );
}
