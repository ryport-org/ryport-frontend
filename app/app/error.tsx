"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full border-coral-warn/30 bg-coral-warn/5">
        <CardBody className="p-6 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-coral-warn/10 text-coral-warn">
            <AlertCircle className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">This page couldn&apos;t load</h2>
            <p className="mt-1 text-sm text-mist">
              {error?.message || "An unexpected error occurred while loading this section."}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => reset()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
