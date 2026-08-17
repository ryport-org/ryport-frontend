import { OnboardingBusinessForm } from "@/components/auth/onboarding-business";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export const metadata = {
  title: "Set up your business — Ryport",
};

export default function BusinessOnboardingPage() {
  return (
    <AuthSplitLayout
      promoTitle="Enterprise financial power."
      promoDescription="Automate cash flow monitoring, collaborate with team members, and get automated CFO intelligence for your Nigerian business."
    >
      <OnboardingBusinessForm />
    </AuthSplitLayout>
  );
}
