"use client";

import type { StaffPermissionKey } from "@/lib/api/types";
import { useStaffAuth } from "@/lib/auth/auth-context";
import { Card, CardBody } from "@/components/ui/card";

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
