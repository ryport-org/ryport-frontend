"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";

type PlanGateProps = {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PlanGate({ feature, children, fallback }: PlanGateProps) {
  const { canUse } = useAuth();
  if (!canUse(feature)) {
    return (
      fallback ?? (
        <div className="rounded-xl border border-line bg-white p-8 text-center">
          <p className="text-sm text-mist">This feature isn&apos;t on your current plan.</p>
          <Button href="/app/upgrade" variant="primary" className="mt-4">
            Upgrade plan
          </Button>
        </div>
      )
    );
  }
  return <>{children}</>;
}
