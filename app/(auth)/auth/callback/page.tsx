"use client";

import { Suspense } from "react";
import AuthCallbackInner from "./callback-inner";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="size-8 animate-spin rounded-full border-2 border-line border-t-sky" />
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
