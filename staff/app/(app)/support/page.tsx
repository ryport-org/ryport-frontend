import { PermissionGate } from "@/components/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";

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
