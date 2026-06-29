import type { Metadata } from "next";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy — Ryport",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" description="Last updated: June 2026" />
      <ContentSection>
        <ContentHeading>What we collect</ContentHeading>
        <p>
          We collect information you provide when creating an account, connecting
          financial accounts, and using Ryport — including name, email, and
          transaction data necessary to deliver our services.
        </p>

        <ContentHeading>How we use it</ContentHeading>
        <p>
          Your data is used to provide dashboards, insights, and AI-powered
          summaries. We do not sell your personal or financial data to third parties.
        </p>

        <ContentHeading>Data retention</ContentHeading>
        <p>
          We retain your data for as long as your account is active. You may
          request deletion at any time by contacting support.
        </p>

        <ContentHeading>Contact</ContentHeading>
        <p>
          For privacy-related questions, email{" "}
          <a href="mailto:privacy@ryport.io" className="text-sky hover:underline">
            privacy@ryport.io
          </a>
          .
        </p>
      </ContentSection>
    </>
  );
}
