import { LoginForm } from "@/components/auth/login-form";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

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
