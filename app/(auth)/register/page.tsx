import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Create Your Free Account",
  description: "Start free — ₦0/mo forever. Connect Nigerian bank accounts, automate budgets, and chat with AI CFO.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      promoTitle="Start free. Grow with intelligence."
      promoDescription="Create your account in minutes. Free forever — upgrade to Pro (₦5,000/mo) or Advanced (₦15,000/mo) when you're ready for more."
    >
      <RegisterForm />
    </AuthSplitLayout>
  );
}
