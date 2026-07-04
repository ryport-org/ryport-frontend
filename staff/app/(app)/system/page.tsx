import { PermissionGate } from "@/components/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function SystemPage() {
  return (
    <>
      <PageHeader title="System" description="Health, Celery, errors, and alerts" />
      <PageBody>
        <PermissionGate permission="can_view_system">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">
                Wire <code className="text-xs">/system/health/</code>, Celery, errors, and alert
                management endpoints.
              </p>
            </CardBody>
          </Card>
        </PermissionGate>
      </PageBody>
    </>
  );
}
