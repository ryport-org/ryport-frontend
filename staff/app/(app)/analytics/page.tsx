import { PermissionGate } from "@/components/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Feature adoption, engagement, and usage" />
      <PageBody>
        <PermissionGate permission="can_view_analytics">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">
                Wire feature-adoption, engagement, AI, banking, and transaction analytics endpoints.
              </p>
            </CardBody>
          </Card>
        </PermissionGate>
      </PageBody>
    </>
  );
}
