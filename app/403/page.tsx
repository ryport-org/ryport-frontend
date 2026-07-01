import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="text-6xl font-display text-ink">403</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">Feature not available</h1>
      <p className="mt-2 max-w-sm text-sm text-mist">
        This feature isn&apos;t included in your current plan.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/app/upgrade" variant="primary">Upgrade plan</Button>
        <Button href="/app/dashboard" variant="secondary">Dashboard</Button>
      </div>
    </div>
  );
}
