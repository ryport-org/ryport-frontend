import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Dashboard — Ryport",
  description: "See revenue, cash flow, and trends in one real-time dashboard.",
};

export default function DashboardPage() {
  return (
    <>
      <PageHero
        eyebrow="Dashboard"
        title="Your numbers, one screen"
        description="Revenue, expenses, and cash flow — updated in real time so you always know where you stand."
      />
      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <DashboardPreview />
        </div>
      </section>
      <ContentSection>
        <ContentHeading>Built for daily decisions</ContentHeading>
        <p>
          Ryport&apos;s dashboard surfaces what matters: today&apos;s revenue, monthly
          trends, and the metrics that tell you if you&apos;re on track — without
          digging through spreadsheets.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
