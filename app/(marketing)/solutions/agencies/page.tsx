import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Cash Flow & Runway Tracking for Agencies",
  description:
    "Multi-account bank aggregation, team cash flow visibility, and automated client invoice tracking for Nigerian digital agencies.",
  path: "/solutions/agencies",
});

export default function AgenciesPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Built for agencies & studios"
        description="Consolidate multiple client bank accounts, monitor retainer burn rate, and calculate runway in real time."
      />
      <ContentSection>
        <ContentHeading>Multi-account aggregation</ContentHeading>
        <p>
          Connect all your agency accounts — operations, payroll, tax reserves — into one central dashboard powered by Mono Open Banking.
        </p>
        <ContentHeading>Runway & burn rate intelligence</ContentHeading>
        <p>
          Never guess your monthly burn rate again. Ryport calculates exact runway days and flags cost anomalies before they hurt profitability.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
