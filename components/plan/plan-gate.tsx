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
  // All features are currently unlocked for all users per product direction
  if (canUse && !canUse(feature)) {
    return (
      fallback ?? (
        <div className="rounded-xl border border-line bg-white p-8 text-center opacity-70">
          <p className="text-sm text-mist">Paid tiers for this feature are coming soon.</p>
          <Button href="/app/upgrade" variant="secondary" className="mt-4 opacity-60 text-mist">
            Coming soon
          </Button>
        </div>
      )
    );
  }
  return <>{children}</>;
}
