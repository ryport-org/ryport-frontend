import type { Metadata } from "next";
import { CustomersGridSection } from "@/components/marketing/customers-grid-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  title: "Customer Stories & Verified Case Studies",
  description:
    "Read verified stories from creators, freelancers, and SME founders across Nigeria using Ryport to track cash flow and calculate runway.",
  path: "/customers",
});

export default function CustomersPage() {
  return (
    <>
      <PageHero
        eyebrow="Customers"
        title="Stories from founders & creators"
        description="See how Nigerian individuals, freelancers, and growing SMEs use Ryport to gain financial clarity."
      />
      <CustomersGridSection />
      <CtaSection />
    </>
  );
}
