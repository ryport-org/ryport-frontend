import { OnboardingSegmentForm } from "@/components/auth/onboarding-segment";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export const metadata = {
  title: "What brings you to Ryport? — Ryport",
};

export default function SegmentOnboardingPage() {
  return (
    <AuthSplitLayout
      promoTitle="Tailored for your financial journey."
      promoDescription="Whether you're managing personal budgets or running a fast-growing Nigerian enterprise, Ryport adapts to your exact financial workflow."
    >
      <OnboardingSegmentForm />
    </AuthSplitLayout>
  );
}
