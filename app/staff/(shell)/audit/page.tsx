"use client";

import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { PaginationBar } from "@/components/staff/shared/pagination";
import { useStaffFetch } from "@/components/staff/hooks/use-staff-fetch";
import { Card } from "@/components/staff/ui/card";
import { staffAuditApi } from "@/lib/staff/api";
import { useState } from "react";

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useStaffFetch(
    (t) => staffAuditApi.listAudit({ page }, t),
    [page],
  );

  return (
    <>
      <PageHeader title="Audit log" description="Staff action history" />
      <PageBody>
        <PermissionGate permission="can_view_audit_log">
          {error ? <ApiErrorBanner message={error} onRetry={reload} /> : null}
          {loading ? (
            <LoadingGrid count={1} height="h-64" />
          ) : data && data.results.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted">
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Resource</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((entry) => (
                      <tr key={entry.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-muted">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 capitalize">{entry.staff_role}</td>
                        <td className="px-4 py-3 text-ink">{entry.action}</td>
                        <td className="px-4 py-3 text-muted">
                          {entry.resource ?? "—"}
                          {entry.resource_id ? ` · ${entry.resource_id.slice(0, 8)}…` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-border p-4">
                <PaginationBar
                  page={data.page}
                  totalPages={data.total_pages}
                  onPage={setPage}
                />
              </div>
            </Card>
          ) : !error ? (
            <p className="text-sm text-muted">No audit entries.</p>
          ) : null}
        </PermissionGate>
      </PageBody>
    </>
  );
}
