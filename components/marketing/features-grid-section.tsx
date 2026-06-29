const features = [
  {
    title: "Financial dashboard",
    description: "Balance, income, expenses, and savings at a glance — updated in real time.",
  },
  {
    title: "AI categorisation",
    description: "Transactions sorted into Food, Transport, Business, and more — no manual tagging.",
  },
  {
    title: "AI chat assistant",
    description: "Ask where your money went and get plain-English answers in seconds.",
  },
  {
    title: "Smart budgets",
    description: "Set limits per category and get alerts before you overspend — not after.",
  },
  {
    title: "AI CFO (Advanced)",
    description: "Runway forecasts, burn rate analysis, and executive insights for your business.",
  },
  {
    title: "Nigerian bank sync",
    description: "Connect supported Nigerian accounts and keep transactions current automatically.",
  },
];

export function FeaturesGridSection({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <section id="features" className="scroll-mt-32 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        {!hideHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-sky">Features</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
            >
              From personal assistant to AI CFO
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              Ryport interprets your data, surfaces insights, and evolves with your financial needs.
            </p>
          </div>
        )}

        <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${hideHeader ? "" : "mt-12"}`}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-line bg-paper p-5 transition-colors hover:border-sky hover:bg-sky-soft"
            >
              <h3 className="font-medium text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
