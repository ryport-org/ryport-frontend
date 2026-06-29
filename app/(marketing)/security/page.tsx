import type { Metadata } from "next";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Security — Ryport",
  description: "Bank-grade security for your financial data. Encrypted at rest and in transit.",
};

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="Your data stays yours"
        description="Ryport is built with the same security standards you'd expect from a financial product — because that's exactly what it is."
      />
      <ContentSection>
        <ContentHeading>Encryption everywhere</ContentHeading>
        <p>
          All data is encrypted in transit using TLS 1.3 and at rest using AES-256.
          Your financial information is never stored in plain text.
        </p>

        <ContentHeading>Access controls</ContentHeading>
        <p>
          Only you can see your data. Team accounts use role-based permissions so
          you control exactly who sees what.
        </p>

        <ContentHeading>Infrastructure</ContentHeading>
        <p>
          Ryport runs on hardened cloud infrastructure with continuous monitoring,
          automated backups, and regular third-party security audits.
        </p>

        <ContentHeading>Compliance</ContentHeading>
        <p>
          We follow industry best practices for data protection and are committed
          to meeting regulatory requirements as we grow.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
