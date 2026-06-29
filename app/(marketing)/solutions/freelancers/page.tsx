import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Freelancers — Ryport",
  description: "Track freelance income and expenses in one simple place.",
};

export default function FreelancersPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Made for freelancers"
        description="Separate business and personal spending, track invoices, and know exactly what you earned this month."
      />
      <ContentSection>
        <ContentHeading>Income you can trust</ContentHeading>
        <p>
          Log payments as they land, categorize expenses in seconds, and see
          your real take-home — not a guess at tax time.
        </p>
        <ContentHeading>Tax-ready exports</ContentHeading>
        <p>
          Pull clean reports whenever you need them. No more digging through bank
          statements line by line.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
