import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Agencies — Ryport",
  description: "Project revenue, team costs, and agency cash flow in one place.",
};

export default function AgenciesPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Clarity for agencies"
        description="Track project revenue, monitor team spending, and keep runway visible as you scale."
      />
      <ContentSection>
        <ContentHeading>Per-project visibility</ContentHeading>
        <p>
          See which clients and projects are profitable — and which need attention
          before margins slip.
        </p>
        <ContentHeading>Team-ready</ContentHeading>
        <p>
          Give your ops lead or co-founder shared visibility without exporting
          spreadsheets every week.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
