import { ShieldCheck, Zap, Building2 } from "lucide-react";

const partners = [
  { name: "Mono Open Banking", icon: ShieldCheck, label: "Real-time Account Sync" },
  { name: "Paystack", icon: Zap, label: "Payment Ingestion" },
  { name: "Nigerian Commercial Banks", icon: Building2, label: "Access, GTBank, Zenith & More" },
];

export function IntegrationsStrip() {
  return (
    <section className="border-y border-line bg-paper py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-mist">
          Integrates with Mono Open Banking &amp; Paystack Infrastructure
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {partners.map((partner) => {
            const IconComp = partner.icon;
            return (
              <div
                key={partner.name}
                className="inline-flex items-center gap-2.5 rounded-2xl border border-line bg-white px-4 py-2 shadow-xs transition-all hover:border-sky/40"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-sky-soft text-sky">
                  <IconComp className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">{partner.name}</p>
                  <p className="text-[10px] text-mist">{partner.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
