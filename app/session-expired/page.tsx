import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <h1 className="font-display text-2xl text-ink">Session expired</h1>
      <p className="mt-2 max-w-sm text-sm text-mist">
        Your session has ended. Sign in again to continue.
      </p>
      <Button href="/login" variant="primary" className="mt-6">
        Sign in
      </Button>
    </div>
  );
}
