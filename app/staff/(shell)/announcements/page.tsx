import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { Card, CardBody } from "@/components/staff/ui/card";

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader title="Announcements" description="Broadcast to customer segments" />
      <PageBody>
        <PermissionGate permission="can_send_announcements">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">
                CRUD + preview via <code className="text-xs">/announcements/</code> endpoints.
              </p>
            </CardBody>
          </Card>
        </PermissionGate>
      </PageBody>
    </>
  );
}
