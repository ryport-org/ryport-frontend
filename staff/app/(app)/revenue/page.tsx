import { PermissionGate } from "@/components/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function RevenuePage() {
  return (
    <>
      <PageHeader title="Revenue" description="MRR, ARR, and plan changes" />
      <PageBody>
        <PermissionGate permission="can_view_revenue">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">
                Connect to <code className="text-xs">GET /revenue/summary/</code> and MRR chart
                endpoints.
              </p>
            </CardBody>
          </Card>
        </PermissionGate>
      </PageBody>
    </>
  );
}
