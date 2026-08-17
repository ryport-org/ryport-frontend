import type { Metadata } from "next";
import { BenefitsSection } from "@/components/marketing/benefits-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Why Choose Ryport",
  description:
    "Understand, manage, and grow — Ryport evolves with you from personal finance management to an intelligent AI CFO.",
  path: "/why-ryport",
});

export default function WhyRyportPage() {
  return (
    <>
      <PageHero
        eyebrow="Why Ryport"
        title="Grows with you at every stage"
        description="Start as an intelligent personal finance assistant. Scale to a complete AI CFO for your business — one platform, evolving intelligence."
      />
      <BenefitsSection hideHeader />
      <CtaSection />
    </>
  );
}
