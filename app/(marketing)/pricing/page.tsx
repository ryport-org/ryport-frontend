import type { Metadata } from "next";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingSection } from "@/components/marketing/pricing-section";
import { UpgradeScenarios } from "@/components/marketing/upgrade-scenarios";

export const metadata: Metadata = {
  title: "Pricing — Ryport",
  description:
    "Free ₦0, Pro ₦5,000/mo, Advanced ₦15,000/mo. AI-powered financial operating system for Nigeria.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="From personal assistant to AI CFO"
        description="Start free forever. Upgrade when you need unlimited AI, business intelligence, or a full AI CFO for your company."
      />
      <PricingSection />
      <ComparisonTable />
      <UpgradeScenarios />
      <CtaSection />
    </>
  );
}
