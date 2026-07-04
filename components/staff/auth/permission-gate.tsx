"use client";

import type { StaffPermissionKey } from "@/lib/staff/api/types";
import { useStaffAuth } from "@/lib/staff/auth/auth-context";
import { Card, CardBody } from "@/components/staff/ui/card";

export function PermissionGate({
  permission,
  children,
}: {
  permission: StaffPermissionKey;
  children: React.ReactNode;
}) {
  const { can } = useStaffAuth();

  if (!can(permission)) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-muted">You do not have access to this section.</p>
        </CardBody>
      </Card>
    );
  }

  return children;
}
