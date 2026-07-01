"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { healthCheck } from "@/lib/api";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

function MaintenancePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return") ?? "/app/dashboard";
  const [checking, setChecking] = useState(true);
  const [isUp, setIsUp] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const redirected = useRef(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const health = await healthCheck();
      const up = health.status === "ok";
      setIsUp(up);
      setLastChecked(new Date());
      if (up && !redirected.current) {
        redirected.current = true;
        router.replace(returnTo);
      }
    } finally {
      setChecking(false);
    }
  }, [router, returnTo]);

  useEffect(() => {
    check();
    const id = window.setInterval(check, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [check]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <div
        className={`size-3 rounded-full ${isUp ? "bg-sky" : checking ? "animate-pulse bg-mist" : "bg-coral-warn"}`}
        aria-hidden="true"
      />
      <h1 className="mt-6 font-display text-2xl text-ink">
        {isUp ? "Back online" : "We'll be right back"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-mist">
        {isUp
          ? "Redirecting you now…"
          : "Ryport is temporarily unavailable. This page checks every 30 seconds and will send you back automatically."}
      </p>
      {lastChecked ? (
        <p className="mt-2 text-xs text-mist">
          Last checked {lastChecked.toLocaleTimeString()}
        </p>
      ) : null}
      <Button className="mt-6" onClick={check} disabled={checking}>
        {checking ? "Checking…" : "Check now"}
      </Button>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <p className="text-sm text-mist">Checking service status…</p>
        </div>
      }
    >
      <MaintenancePageInner />
    </Suspense>
  );
}
