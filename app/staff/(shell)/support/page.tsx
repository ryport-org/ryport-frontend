import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { Card, CardBody } from "@/components/staff/ui/card";

export default function SupportPage() {
  return (
    <>
      <PageHeader title="Support" description="Flagged users and support notes" />
      <PageBody>
        <PermissionGate permission="can_suspend_users">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">
                Connect to <code className="text-xs">GET /support/flagged-users/</code> and notes
                endpoints.
              </p>
            </CardBody>
          </Card>
        </PermissionGate>
      </PageBody>
    </>
  );
}
