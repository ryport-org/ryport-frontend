import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Financial Intelligence for Freelancers",
  description:
    "Separate personal and client income, track tax obligations, and automate budget tracking for Nigerian freelancers.",
  path: "/solutions/freelancers",
});

export default function FreelancersPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Built for freelancers & creators"
        description="Master irregular income, track client payments, and manage expenses with automated kobo accounting."
      />
      <ContentSection>
        <ContentHeading>Smooth out variable income</ContentHeading>
        <p>
          Freelance income goes up and down. Ryport helps you build a cash buffer, set monthly safety targets, and forecast low-balance dates before they hit.
        </p>
        <ContentHeading>Personal & business split</ContentHeading>
        <p>
          Automatically categorize client payouts versus personal spending so you always stay tax-ready without spreadsheet headaches.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
