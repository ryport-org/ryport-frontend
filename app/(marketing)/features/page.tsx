import type { Metadata } from "next";
import { AiInsightsSection } from "@/components/marketing/ai-insights-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesGridSection } from "@/components/marketing/features-grid-section";
import { PageHero } from "@/components/marketing/page-hero";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Features & Capabilities",
  description:
    "Explore Ryport features: Mono Open Banking sync, kobo expense categorization, budget alerts, and conversational AI CFO.",
  path: "/features",
});

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
