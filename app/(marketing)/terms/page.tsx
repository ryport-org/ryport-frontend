import type { Metadata } from "next";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Terms of Service — Ryport",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Service" description="Last updated: June 2026" />
      <ContentSection>
        <ContentHeading>Acceptance</ContentHeading>
        <p>
          By using Ryport, you agree to these terms. If you do not agree, please
          do not use the service.
        </p>

        <ContentHeading>Service description</ContentHeading>
        <p>
          Ryport provides financial tracking, reporting, and AI-powered insights.
          We do not provide legal, tax, or investment advice.
        </p>

        <ContentHeading>Your responsibilities</ContentHeading>
        <p>
          You are responsible for maintaining the security of your account
          credentials and for the accuracy of information you provide.
        </p>

        <ContentHeading>Limitation of liability</ContentHeading>
        <p>
          Ryport is provided &ldquo;as is.&rdquo; We are not liable for decisions made
          based on information displayed in the product.
        </p>
      </ContentSection>
    </>
  );
}
