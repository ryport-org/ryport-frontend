"use client";

import { Suspense } from "react";
import AcceptInviteInner from "./accept-inner";

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-paper">Loading…</div>}>
      <AcceptInviteInner />
    </Suspense>
  );
}
