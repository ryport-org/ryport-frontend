import { plans } from "@/lib/pricing-data";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ShieldCheck } from "lucide-react";

type PricingSectionProps = {
  compact?: boolean;
};

export function PricingSection({ compact = false }: PricingSectionProps) {
  return (
    <section className="scroll-mt-32 border-t border-line bg-paper" id="pricing">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        {!compact && (
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky">Simple Pricing</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.12 }}
            >
              Start free. Grow with intelligence.
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              From personal finance assistant to AI CFO — pick the plan that fits where you are today.
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const isPro = plan.id === "pro";
            const explicitCtaText =
              plan.id === "free"
                ? "Start free — ₦0/mo"
                : plan.id === "pro"
                ? "Get Pro — ₦5,000/mo"
                : "Get Advanced — ₦15,000/mo";

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                  isPro
                    ? "bg-[#0B0E1A] text-white shadow-2xl shadow-brand/20 ring-2 ring-brand scale-[1.02] z-10"
                    : "bg-white text-ink border border-line shadow-sm hover:shadow-md"
                }`}
              >
                {/* Popular Tag */}
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                      <Sparkles className="size-3" /> Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isPro ? "text-sky" : "text-sky"}`}>
                    {plan.tagline}
                  </p>

                  <h3 className={`mt-2 font-display text-2xl font-bold ${isPro ? "text-white" : "text-ink"}`}>
                    {plan.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className={`font-display tabular-nums text-4xl lg:text-5xl font-bold ${isPro ? "text-white" : "text-ink"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${isPro ? "text-slate-400" : "text-mist"}`}>
                      {plan.period}
                    </span>
                  </div>

                  <p className={`mt-2 text-xs font-medium ${isPro ? "text-slate-300" : "text-mist"}`}>
                    Ideal for: {plan.idealFor}
                  </p>

                  <p className={`mt-4 text-sm leading-relaxed ${isPro ? "text-slate-300" : "text-mist"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className={`mt-8 pt-6 border-t ${isPro ? "border-slate-800" : "border-line/70"} flex-1 flex flex-col justify-between`}>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${isPro ? "bg-brand text-white" : "bg-sky-soft text-sky"}`}>
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                        <span className={isPro ? "text-slate-200" : "text-ink"}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button
                      href={plan.href}
                      variant={isPro ? "primary" : "secondary"}
                      className={`w-full py-3 text-sm font-semibold rounded-xl ${
                        isPro
                          ? "bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/30"
                          : "bg-paper text-ink border border-line hover:bg-sky-soft hover:text-sky"
                      }`}
                    >
                      {explicitCtaText}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Trust Note */}
        <div className="mt-12 text-center text-xs font-medium text-mist flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600 inline" />
          <span>All plans include AES-256 bank-level encryption and read-only Mono Open Banking sync.</span>
        </div>
      </div>
    </section>
  );
}
