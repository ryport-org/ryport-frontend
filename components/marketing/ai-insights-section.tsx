"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";

const scenarioCards = [
  {
    id: "spending-spikes",
    category: "Personal Assistant",
    tagline: "Spending Anomaly Alert",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Food & generator fuel spike detected",
    insight: "You spent ₦45,000 on dining out and ₦22,000 on fuel this week — 34% higher than your 4-week average.",
    actionText: "Adjust category limit",
    meta: "Updated 10m ago · Personal Account",
    icon: AlertTriangle,
    accent: "from-amber-500/10 to-orange-500/5",
    metrics: [
      { label: "Food & Dining", value: "₦45,000", change: "+34%" },
      { label: "Fuel & Power", value: "₦22,000", change: "+18%" },
    ],
  },
  {
    id: "school-fees",
    category: "Smart Planning",
    tagline: "Upcoming Obligation",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    title: "School fees due in 3 weeks",
    insight: "Term 2 tuition of ₦150,000 is due on Sept 10th. Based on your current income pattern, you'll reach 88% of your target balance.",
    actionText: "Set automated savings rule",
    meta: "Forecast Model · High Confidence",
    icon: Calendar,
    accent: "from-blue-500/10 to-sky-500/5",
    metrics: [
      { label: "Target Amount", value: "₦150,000", change: "Due Sept 10" },
      { label: "Projected Balance", value: "₦132,000", change: "88% Covered" },
    ],
  },
  {
    id: "business-cashflow",
    category: "AI CFO",
    tagline: "Receivables & Runway",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "3 client invoices overdue",
    insight: "Unpaid invoices total ₦320,000. Send automated payment reminders via Paystack links to maintain 4.2 months of cash runway.",
    actionText: "Send payment reminders",
    meta: "Advanced Plan · AI CFO Engine",
    icon: TrendingUp,
    accent: "from-emerald-500/10 to-teal-500/5",
    metrics: [
      { label: "Overdue Receivables", value: "₦320,000", change: "3 Invoices" },
      { label: "Current Runway", value: "4.2 Months", change: "Healthy" },
    ],
  },
];

export function AiInsightsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMediaChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    let ticking = false;
    const handleScroll = () => {
      if (!containerRef.current || mediaQuery.matches) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const totalScrollable = rect.height - window.innerHeight;

          if (totalScrollable > 0) {
            const current = -rect.top;
            const norm = Math.max(0, Math.min(1, current / totalScrollable));
            setProgress(norm);

            if (norm < 0.35) {
              setActiveStep(0);
            } else if (norm < 0.7) {
              setActiveStep(1);
            } else {
              setActiveStep(2);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return (
    <section id="ai-insights" className="relative scroll-mt-32 border-t border-line bg-paper">
      {/* ───────────────────────────────────────────────────────────
          DESKTOP PINNED SCROLL INTERACTION (lg:block, hidden on mobile)
          ─────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="hidden lg:block relative h-[280vh] w-full"
      >
        <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
          <div className="mx-auto max-w-7xl px-8 w-full">
            <div className="grid grid-cols-12 gap-12 items-center">
              {/* Pinned Left Content */}
              <div className="col-span-5 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky-soft px-3.5 py-1 text-xs font-semibold text-sky w-fit">
                  <Sparkles className="size-3.5 text-sky" />
                  <span>Signature AI Engine</span>
                </div>

                <h2
                  className="mt-6 font-display text-ink"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.12 }}
                >
                  Your numbers, explained in plain English
                </h2>

                <p className="mt-4 text-mist text-base leading-relaxed">
                  Ryport monitors your accounts 24/7, surfaces spending anomalies,
                  and predicts cashflow needs before they happen — no spreadsheets or accounting jargon.
                </p>

                {/* Progress Indicators */}
                <div className="mt-8 space-y-3">
                  {scenarioCards.map((card, idx) => {
                    const isActive = activeStep === idx;
                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          if (!containerRef.current) return;
                          const rect = containerRef.current.getBoundingClientRect();
                          const totalScrollable = rect.height - window.innerHeight;
                          const targetRatio = idx === 0 ? 0.15 : idx === 1 ? 0.5 : 0.85;
                          const targetY = window.scrollY + rect.top + targetRatio * totalScrollable;
                          window.scrollTo({ top: targetY, behavior: "smooth" });
                        }}
                        className={`group flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? "border-sky bg-white shadow-md shadow-sky/5"
                            : "border-transparent bg-paper/60 hover:bg-white hover:border-line"
                        }`}
                      >
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                            isActive
                              ? "bg-brand text-white"
                              : "bg-line/60 text-mist group-hover:text-ink"
                          }`}
                        >
                          0{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold uppercase tracking-wide ${isActive ? "text-sky" : "text-mist"}`}>
                            {card.category}
                          </p>
                          <p className={`text-sm font-medium truncate ${isActive ? "text-ink" : "text-mist"}`}>
                            {card.title}
                          </p>
                        </div>
                        <div className={`size-2 rounded-full transition-all ${isActive ? "bg-sky scale-125" : "bg-line"}`} />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-line/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-mist">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Real-time Mono & Paystack sync</span>
                  </div>
                  <Link
                    href="/ai-insights"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"
                  >
                    Learn about AI <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pinned Right Card Stack */}
              <div className="col-span-7 relative h-[440px] flex items-center justify-center">
                {scenarioCards.map((card, idx) => {
                  const IconComp = card.icon;

                  let cardOpacity = 0;
                  let cardTranslateY = 32;
                  let cardScale = 0.95;

                  if (prefersReducedMotion) {
                    cardOpacity = activeStep === idx ? 1 : 0;
                    cardTranslateY = activeStep === idx ? 0 : 20;
                    cardScale = 1;
                  } else {
                    if (idx === 0) {
                      if (progress <= 0.35) {
                        cardOpacity = 1;
                        cardTranslateY = 0;
                        cardScale = 1;
                      } else {
                        const exitRatio = Math.min(1, (progress - 0.35) / 0.15);
                        cardOpacity = 1 - exitRatio;
                        cardTranslateY = -30 * exitRatio;
                        cardScale = 1 - 0.05 * exitRatio;
                      }
                    } else if (idx === 1) {
                      if (progress < 0.25) {
                        cardOpacity = 0;
                        cardTranslateY = 40;
                        cardScale = 0.94;
                      } else if (progress < 0.38) {
                        const enterRatio = (progress - 0.25) / 0.13;
                        cardOpacity = enterRatio;
                        cardTranslateY = 40 * (1 - enterRatio);
                        cardScale = 0.94 + 0.06 * enterRatio;
                      } else if (progress <= 0.68) {
                        cardOpacity = 1;
                        cardTranslateY = 0;
                        cardScale = 1;
                      } else {
                        const exitRatio = Math.min(1, (progress - 0.68) / 0.15);
                        cardOpacity = 1 - exitRatio;
                        cardTranslateY = -30 * exitRatio;
                        cardScale = 1 - 0.05 * exitRatio;
                      }
                    } else if (idx === 2) {
                      if (progress < 0.6) {
                        cardOpacity = 0;
                        cardTranslateY = 40;
                        cardScale = 0.94;
                      } else if (progress < 0.72) {
                        const enterRatio = (progress - 0.6) / 0.12;
                        cardOpacity = enterRatio;
                        cardTranslateY = 40 * (1 - enterRatio);
                        cardScale = 0.94 + 0.06 * enterRatio;
                      } else {
                        cardOpacity = 1;
                        cardTranslateY = 0;
                        cardScale = 1;
                      }
                    }
                  }

                  return (
                    <div
                      key={card.id}
                      className="absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                      style={{
                        opacity: cardOpacity,
                        transform: `translateY(${cardTranslateY}px) scale(${cardScale})`,
                        zIndex: activeStep === idx ? 30 : 10,
                        pointerEvents: cardOpacity > 0.5 ? "auto" : "none",
                      }}
                    >
                      <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-8 shadow-[0_12px_40px_rgba(11,14,26,0.08)]">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${card.badgeColor}`}
                          >
                            <IconComp className="size-3.5" />
                            {card.tagline}
                          </span>
                          <span className="text-xs text-mist font-mono">{card.meta}</span>
                        </div>

                        {/* Title & Insight */}
                        <h3 className="mt-5 text-xl font-semibold text-ink leading-snug">
                          {card.title}
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-mist">
                          {card.insight}
                        </p>

                        {/* Metrics Grid */}
                        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-line/70 bg-paper p-4">
                          {card.metrics.map((m) => (
                            <div key={m.label}>
                              <p className="text-xs text-mist">{m.label}</p>
                              <p className="mt-1 font-mono text-lg font-bold text-ink tabular-nums">
                                {m.value}
                              </p>
                              <p className="text-[11px] font-medium text-sky">{m.change}</p>
                            </div>
                          ))}
                        </div>

                        {/* Action CTA */}
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-line/60">
                          <span className="text-xs font-medium text-mist">Suggested Action</span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand/90 transition-colors"
                          >
                            {card.actionText}
                            <ArrowRight className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          MOBILE FALLBACK (lg:hidden) — Simple stacked cards, no scroll pinning
          ─────────────────────────────────────────────────────────── */}
      <div className="lg:hidden mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky-soft px-3.5 py-1 text-xs font-semibold text-sky">
            <Sparkles className="size-3.5 text-sky" />
            <span>AI Insights</span>
          </div>
          <h2
            className="mt-4 font-display text-ink"
            style={{ fontSize: "clamp(1.75rem, 4vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
          >
            Your numbers, explained in plain English
          </h2>
          <p className="mt-3 text-sm text-mist leading-relaxed">
            Ryport watches your transactions and tells you what matters — in clear, human language.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {scenarioCards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.id}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${card.badgeColor}`}
                  >
                    <IconComp className="size-3.5" />
                    {card.tagline}
                  </span>
                  <span className="text-[11px] font-mono text-mist">Step 0{idx + 1}</span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{card.insight}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-line/70 bg-paper p-3.5">
                  {card.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-[11px] text-mist">{m.label}</p>
                      <p className="mt-0.5 font-mono text-base font-bold text-ink tabular-nums">
                        {m.value}
                      </p>
                      <p className="text-[10px] font-medium text-sky">{m.change}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-line/60">
                  <span className="text-xs text-mist">{card.meta}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white"
                  >
                    {card.actionText}
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
