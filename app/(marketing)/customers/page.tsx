import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { CustomersGridSection } from "@/components/marketing/customers-grid-section";
import { PageHero } from "@/components/marketing/page-hero";
import { UpgradeScenarios } from "@/components/marketing/upgrade-scenarios";

export const metadata: Metadata = {
  title: "Customers — Ryport",
  description: "See how students, freelancers, and founders use Ryport across Nigeria.",
};

export default function CustomersPage() {
  return (
    <>
      <PageHero
        eyebrow="Customers"
        title="Real people. Real results."
        description="From students saving their first ₦5,000 to founders running multi-million-naira businesses."
      />
      <UpgradeScenarios />
      <CustomersGridSection />
      <CtaSection />
    </>
  );
}
