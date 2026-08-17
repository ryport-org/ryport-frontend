import type { Metadata } from "next";
import { AiInsightsSection } from "@/components/marketing/ai-insights-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "AI CFO Insights",
  description:
    "Plain-English financial summaries, spending anomaly detection, and automated 30-day cash flow projections.",
  path: "/ai-insights",
});

export default function AiInsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="AI Insights"
        title="Your numbers, explained"
        description="Ryport watches your transactions and tells you what matters — in clear, human language."
      />
      <AiInsightsSection />
      <CtaSection />
    </>
  );
}
