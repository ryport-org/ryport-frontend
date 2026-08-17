import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { ShieldCheck, Lock, Server, FileCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Security — Ryport",
  description: "Bank-grade security for your financial data. Encrypted at rest and in transit.",
};

const securityPillars = [
  {
    icon: Lock,
    title: "Encryption everywhere",
    description:
      "All data is encrypted in transit using TLS 1.3 and at rest using AES-256-GCM. Your financial credentials and banking tokens are never stored in plain text.",
    badge: "AES-256 Encryption",
  },
  {
    icon: ShieldCheck,
    title: "Read-only bank connections",
    description:
      "Mono Open Banking integration operates strictly on read-only permissions. Ryport can never initiate payments, move funds, or alter your bank accounts.",
    badge: "Read-Only Access",
  },
  {
    icon: Server,
    title: "Hardened infrastructure",
    description:
      "Ryport runs on isolated cloud infrastructure with continuous monitoring, automated database backups, and strict network perimeter security.",
    badge: "99.9% Uptime SLA",
  },
  {
    icon: FileCheck2,
    title: "Compliance & audit trails",
    description:
      "Full immutable audit logs track all data interactions. We follow strict data privacy best practices and comply with local data protection regulations.",
    badge: "Immutable Audit Log",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="Your data stays yours"
        description="Ryport is built with bank-grade security standards — read-only sync, AES-256 encryption, and zero stored bank passwords."
      />

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-8 sm:grid-cols-2">
            {securityPillars.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-line bg-white p-8 shadow-sm transition-all hover:border-sky/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-soft text-sky">
                      <IconComp className="size-6" />
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl text-ink font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-mist">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
