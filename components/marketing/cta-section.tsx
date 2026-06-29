import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-sky-soft px-8 py-12 text-center sm:px-12">
          <h2
            className="font-display text-ink"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
          >
            Start free. Grow with intelligence.
          </h2>
          <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
            Your AI-powered financial operating system — from pocket money to profit &amp; loss.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/register">Start free — ₦0/mo</Button>
            <Button href="/pricing" variant="secondary">
              View plans
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {["Free forever plan", "Built for Nigeria", "Cancel anytime"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-mist">
                <span className="size-1.5 rounded-full bg-sky" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
