"use client";

import { useEffect } from "react";
import { Button } from "@/components/staff/ui/button";
import { Card, CardBody } from "@/components/staff/ui/card";

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Staff page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-12 px-4">
      <Card className="border-coral-warn/30 bg-coral-warn/5">
        <CardBody className="p-6 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-coral-warn/10 text-coral-warn font-bold text-lg">
            !
          </div>
          <h2 className="text-lg font-semibold text-ink">Something went wrong</h2>
          <p className="text-sm text-muted">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="primary" onClick={() => reset()}>
              Try again
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
