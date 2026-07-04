import { PermissionGate } from "@/components/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Users" description="Search and manage customer accounts" />
      <PageBody>
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              User list wiring — connect to <code className="text-xs">GET /users/</code> with
              filters for plan, suspension, and search.
            </p>
          </CardBody>
        </Card>
      </PageBody>
    </>
  );
}
