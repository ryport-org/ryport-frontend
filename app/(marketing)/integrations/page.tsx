import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Integrations — Ryport",
  description: "Connect the banks and tools you already use with Ryport.",
};

const integrations = [
  { name: "Bank connections", description: "Link accounts securely and sync transactions automatically." },
  { name: "Accounting exports", description: "Export clean CSV and PDF reports for your accountant." },
  { name: "Payment platforms", description: "Pull in revenue from payment processors you rely on." },
  { name: "Slack alerts", description: "Get notified when spending spikes or revenue milestones hit." },
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Works with your stack"
        description="Ryport connects to the financial tools you already use — so your data stays in sync without manual entry."
      />
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-line bg-white p-6"
              >
                <h3 className="font-medium text-ink">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ContentSection>
        <ContentHeading>More coming soon</ContentHeading>
        <p>
          We&apos;re adding new integrations regularly. Need something specific?
          Let us know through the contact page.
        </p>
      </ContentSection>
      <CtaSection />
    </>
  );
}
