import type { Metadata } from "next";
import { AiInsightsSection } from "@/components/marketing/ai-insights-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "AI Insights — Ryport",
  description: "Plain-English summaries that explain why your numbers moved.",
};

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
