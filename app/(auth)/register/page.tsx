import { RegisterForm } from "@/components/auth/register-form";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export const metadata = {
  title: "Get started — Ryport",
};

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
