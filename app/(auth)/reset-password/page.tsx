import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export const metadata = { title: "Reset password — Ryport" };

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <Card className="w-full max-w-md">
        <CardBody className="text-center">
          <h1 className="font-display text-2xl text-ink">Reset your password</h1>
          <p className="mt-2 text-sm text-mist">
            Password reset is initiated from your email link. Open the link we sent you to set a new password.
          </p>
          <Button href="/login" variant="primary" className="mt-6">
            Back to login
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
