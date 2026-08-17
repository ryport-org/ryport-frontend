import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Log In",
  description: "Log in to your Ryport account to access financial dashboards, AI insights, and kobo transaction logs.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthSplitLayout
      promoTitle="Understand. Manage. Grow."
      promoDescription="Log in to track every naira, get AI insights built for Nigeria, and evolve from personal finance to business intelligence."
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
