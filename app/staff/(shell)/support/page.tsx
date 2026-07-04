"use client";

import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { useStaffFetch } from "@/components/staff/hooks/use-staff-fetch";
import { Badge } from "@/components/staff/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import { staffSupportApi } from "@/lib/staff/api";

export default function SupportPage() {
  const flagged = useStaffFetch((t) => staffSupportApi.getFlaggedUsers(t), []);
  const notes = useStaffFetch((t) => staffSupportApi.listNotes({ is_flagged: true }, t), []);

  const error = flagged.error || notes.error;
  const loading = flagged.loading || notes.loading;

  return (
    <>
      <PageHeader title="Support" description="Flagged users and support notes" />
      <PageBody>
        <PermissionGate permission="can_suspend_users">
          {error ? (
            <ApiErrorBanner message={error} onRetry={() => { flagged.reload(); notes.reload(); }} />
          ) : null}
          {loading ? (
            <LoadingGrid count={1} height="h-48" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-ink">Flagged users</h2>
                </CardHeader>
                <CardBody className="pt-0">
                  {!flagged.data?.length ? (
                    <p className="text-sm text-muted">No flagged users.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {flagged.data.map((u) => (
                        <li key={u.id} className="py-3">
                          <p className="text-sm font-medium text-ink">{u.email_masked}</p>
                          {u.reason ? <p className="text-xs text-muted">{u.reason}</p> : null}
                          {u.plan ? <Badge className="mt-1 capitalize">{u.plan}</Badge> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-ink">Flagged notes</h2>
                </CardHeader>
                <CardBody className="pt-0">
                  {!notes.data?.length ? (
                    <p className="text-sm text-muted">No flagged notes.</p>
                  ) : (
                    <ul className="space-y-3">
                      {notes.data.map((n) => (
                        <li key={n.id} className="rounded-md border border-border p-3 text-sm">
                          <p className="font-medium text-ink">{n.email_masked ?? "User"}</p>
                          <p className="mt-1 text-ink">{n.body}</p>
                          <p className="mt-1 text-xs text-muted">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </PermissionGate>
      </PageBody>
    </>
  );
}
