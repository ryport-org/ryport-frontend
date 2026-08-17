import type { Metadata } from "next";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "About Us",
  description:
    "Ryport is Nigeria's premier AI-powered Financial Operating System for individuals, freelancers, and growing SMEs.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="What is Ryport?"
        description="An AI-powered Financial Operating System that helps you understand, manage, and grow your finances — evolving from personal assistant to AI CFO."
      />
      <ContentSection>
        <ContentHeading>More than tracking</ContentHeading>
        <p>
          Unlike traditional finance apps that only record numbers, Ryport interprets
          your financial data, surfaces actionable insights, and adapts as your needs
          grow — whether you&apos;re a student tracking pocket money or a founder running
          a startup.
        </p>

        <ContentHeading>Built for Nigeria</ContentHeading>
        <p>
          Ryport natively understands Nigerian financial infrastructure — Mono Open Banking,
          Paystack, and local bank formats — giving you intelligence generic apps
          cannot provide.
        </p>

        <ContentHeading>Ryport Technologies Ltd</ContentHeading>
        <p>
          © {new Date().getFullYear()} Ryport Technologies Ltd · ryport.com.ng
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
