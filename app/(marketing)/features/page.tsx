import type { Metadata } from "next";
import { AiInsightsSection } from "@/components/marketing/ai-insights-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesGridSection } from "@/components/marketing/features-grid-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Features — Ryport",
  description: "Everything you need to run the numbers — dashboards, AI insights, and more.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Everything you need to run the numbers"
        description="Modern tools without the enterprise overhead. Built for founders who want clarity, not complexity."
      />
      <FeaturesGridSection hideHeader />
      <AiInsightsSection />
      <CtaSection />
    </>
  );
}
