import { PermissionGate } from "@/components/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit log" description="Staff action history" />
      <PageBody>
        <PermissionGate permission="can_view_audit_log">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">
                Connect to <code className="text-xs">GET /audit/</code> with filters and CSV export.
              </p>
            </CardBody>
          </Card>
        </PermissionGate>
      </PageBody>
    </>
  );
}
