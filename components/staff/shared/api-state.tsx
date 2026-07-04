"use client";

import { Button } from "@/components/staff/ui/button";
import { Card, CardBody } from "@/components/staff/ui/card";

export function ApiErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-danger/30 bg-danger/5">
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-danger">{message}</p>
        {onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function LoadingGrid({ count = 4, height = "h-28" }: { count?: number; height?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-lg bg-border/60 ${height}`} />
      ))}
    </div>
  );
}
