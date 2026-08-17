"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
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
    metrics: [
      { label: "Overdue Receivables", value: "₦320,000", change: "3 Invoices" },
      { label: "Current Runway", value: "4.2 Months", change: "Healthy" },
    ],
  },
];

export function AiInsightsSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through steps every 5 seconds unless user pauses/interacts
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % scenarioCards.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeCard = scenarioCards[activeStep];
  const IconComp = activeCard.icon;

  return (
    <section id="ai-insights" className="scroll-mt-32 border-t border-line bg-paper py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Text & Step Selector */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky">
              AI Engine
            </p>

            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.12 }}
            >
              Your numbers, explained in plain English
            </h2>

            <p className="mt-4 text-mist text-base leading-relaxed">
              Ryport monitors your accounts 24/7, surfaces spending anomalies,
              and predicts cashflow needs before they happen — no spreadsheets or accounting jargon.
            </p>

            {/* Interactive Step Items */}
            <div
              className="mt-8 space-y-3"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {scenarioCards.map((card, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left group flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "border-sky bg-white shadow-md shadow-sky/5"
                        : "border-transparent bg-white/50 hover:bg-white hover:border-line"
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
                      <p className={`text-sm font-medium truncate ${isActive ? "text-ink font-semibold" : "text-mist"}`}>
                        {card.title}
                      </p>
                    </div>
                    <div className={`size-2 rounded-full transition-all ${isActive ? "bg-sky scale-125" : "bg-line"}`} />
                  </button>
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

          {/* Right Column: Active Scenario Card Display */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <div
              key={activeCard.id}
              className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(11,14,26,0.08)] transition-all duration-300 animate-in fade-in zoom-in-95"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${activeCard.badgeColor}`}
                >
                  <IconComp className="size-3.5" />
                  {activeCard.tagline}
                </span>
                <span className="text-xs text-mist font-mono">{activeCard.meta}</span>
              </div>

              {/* Title & Insight */}
              <h3 className="mt-5 text-xl font-semibold text-ink leading-snug">
                {activeCard.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-mist">
                {activeCard.insight}
              </p>

              {/* Metrics Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-line/70 bg-paper p-4">
                {activeCard.metrics.map((m) => (
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
                  {activeCard.actionText}
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
