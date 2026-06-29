const insights = [
  "You spent ₦40,000 on food this month — your largest category.",
  "Transport was your second highest expense at ₦18,500.",
  "Based on your patterns, your balance on the 15th will be approximately ₦42,000.",
];

export function AiInsightsSection() {
  return (
    <section className="scroll-mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium text-sky">AI Insights</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
            >
              Your numbers, explained.
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              Ryport watches your transactions and tells you what matters — in
              clear, human language. No spreadsheets, no jargon.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Plain-English summaries every week",
                "Spot anomalies before they become problems",
                "Personalized growth recommendations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight}
                className="rounded-xl border border-line bg-white px-5 py-4 text-sm leading-relaxed text-ink shadow-[0_2px_12px_rgba(19,23,31,0.04)]"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
