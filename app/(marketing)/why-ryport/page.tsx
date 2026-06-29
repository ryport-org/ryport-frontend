import type { Metadata } from "next";
import { BenefitsSection } from "@/components/marketing/benefits-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Why Ryport — Ryport",
  description: "Understand, manage, and grow — Ryport grows with you from personal finance to AI CFO.",
};

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
