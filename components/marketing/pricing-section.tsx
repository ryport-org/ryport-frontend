import { plans } from "@/lib/pricing-data";
import { Button } from "@/components/ui/button";

type PricingSectionProps = {
  compact?: boolean;
};

export function PricingSection({ compact = false }: PricingSectionProps) {
  return (
    <section className="scroll-mt-32 border-t border-line bg-paper" id="pricing">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        {!compact && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-medium text-sky">Pricing</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
            >
              Start free. Grow with intelligence.
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              From personal finance assistant to AI CFO — pick the plan that fits where you are today.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-6 lg:p-8 ${
                plan.highlighted
                  ? "border-sky bg-white shadow-[0_8px_32px_rgba(61,139,255,0.12)]"
                  : "border-line bg-white"
              }`}
            >
              {plan.highlighted ? (
                <span className="mb-3 inline-flex w-fit rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-sky">
                  Most popular
                </span>
              ) : (
                <span className="mb-3 h-6" aria-hidden="true" />
              )}

              <p className="text-xs font-medium uppercase tracking-wide text-sky">{plan.tagline}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display tabular-nums text-4xl text-ink">{plan.price}</span>
                <span className="text-sm text-mist">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-mist">Ideal for {plan.idealFor}</p>
              <p className="mt-4 text-sm leading-relaxed text-mist">{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  href={plan.href}
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
