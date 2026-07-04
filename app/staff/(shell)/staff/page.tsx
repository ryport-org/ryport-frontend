import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { Card, CardBody } from "@/components/staff/ui/card";

export default function StaffManagementPage() {
  return (
    <>
      <PageHeader title="Staff" description="Invite and manage internal team members" />
      <PageBody>
        <PermissionGate permission="can_manage_staff">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">
                List, invite, and deactivate staff via <code className="text-xs">/staff/</code>{" "}
                endpoints.
              </p>
            </CardBody>
          </Card>
        </PermissionGate>
      </PageBody>
    </>
  );
}
