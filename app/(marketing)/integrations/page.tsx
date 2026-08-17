import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { Building2, Zap, FileSpreadsheet, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations — Ryport",
  description: "Connect the banks and financial tools you already use in Nigeria with Ryport.",
};

const integrationsList = [
  {
    icon: Building2,
    name: "Mono Open Banking",
    category: "Bank Sync",
    description: "Link GTBank, Access, Zenith, Kuda, Moniepoint, and supported commercial accounts securely. Real-time balance and ledger updates.",
    status: "Live & Active",
  },
  {
    icon: Zap,
    name: "Paystack",
    category: "Payment Processor",
    description: "Automatically pull in customer payments, digital invoices, and payout receipts to keep revenue metrics accurate.",
    status: "Live & Active",
  },
  {
    icon: FileSpreadsheet,
    name: "Accounting & CSV Exports",
    category: "Reports & Audit",
    description: "Export clean PDF financial statements, Excel workbooks, and CSV logs ready for your tax advisor or accountant.",
    status: "Pro & Advanced",
  },
  {
    icon: Bell,
    name: "Instant Alerts & Reminders",
    category: "Notifications",
    description: "Get real-time alerts when large transactions land, category budgets near 80%, or upcoming bill dates approach.",
    status: "Automated",
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Works with your financial stack"
        description="Ryport connects directly to Nigerian banks and payment processors — so your data stays current without manual spreadsheet entry."
      />

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-8 sm:grid-cols-2">
            {integrationsList.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.name}
                  className="rounded-3xl border border-line bg-white p-8 shadow-sm transition-all hover:border-sky/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <IconComp className="size-6" />
                    </div>
                    <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-sky">
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-sky">{item.category}</p>

                  <h3 className="mt-1 font-display text-xl text-ink font-semibold">
                    {item.name}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-mist">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-3xl border border-line bg-white p-8 lg:p-12 text-center max-w-3xl mx-auto shadow-sm">
            <h3 className="font-display text-2xl text-ink">Need a custom integration?</h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              We&apos;re constantly building new bank connectors and payment tool adapters for Nigerian businesses. Need custom API access for your enterprise?
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand/20 hover:bg-brand/90 transition-all"
              >
                Request an integration <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
