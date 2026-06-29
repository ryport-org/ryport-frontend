import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Small Business — Ryport",
  description: "Financial clarity for small businesses without the accounting overhead.",
};

export default function SmallBusinessPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Built for small business"
        description="Track revenue, control spending, and plan ahead — without hiring a finance team."
      />
      <ContentSection>
        <ContentHeading>See the full picture</ContentHeading>
        <p>
          Small business owners wear every hat. Ryport gives you one dashboard for
          income, expenses, and cash flow so you can focus on growing — not
          reconciling spreadsheets.
        </p>
        <ContentHeading>AI that speaks your language</ContentHeading>
        <p>
          Get weekly summaries in plain English: what changed, what to watch, and
          where you can save.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
