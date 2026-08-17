"use client";

import { useState } from "react";
import { LayoutDashboard, Sparkles, Building2, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const featureCategories = [
  { id: "all", label: "All Capabilities" },
  { id: "personal", label: "Personal Assistant" },
  { id: "business", label: "Business Operations" },
  { id: "cfo", label: "AI CFO Suite" },
];

const features = [
  {
    category: "personal",
    title: "Financial Dashboard",
    description: "Balance, income, expenses, and savings at a glance — updated in real time across all accounts.",
    icon: LayoutDashboard,
    badge: "Free & Pro",
  },
  {
    category: "personal",
    title: "AI Categorisation",
    description: "Transactions sorted into Food, Transport, Fuel, Rent, and Business — no manual tagging.",
    icon: Sparkles,
    badge: "Automated",
  },
  {
    category: "personal",
    title: "AI Chat Assistant",
    description: "Ask where your money went and get plain-English answers in seconds on mobile or desktop.",
    icon: Zap,
    badge: "10/day on Free · Unlimited on Pro",
  },
  {
    category: "business",
    title: "Smart Category Budgets",
    description: "Set limits per category and receive proactive alerts before you overspend — not after.",
    icon: ShieldCheck,
    badge: "Pro & Advanced",
  },
  {
    category: "cfo",
    title: "AI CFO Engine",
    description: "Runway forecasts, burn rate analysis, cash flow alerts, and executive summaries for your business.",
    icon: Building2,
    badge: "Advanced Plan",
  },
  {
    category: "business",
    title: "Nigerian Bank & Paystack Sync",
    description: "Connect supported Nigerian accounts (Access, GTBank, Zenith, Kuda, Moniepoint) via Mono Open Banking.",
    icon: ShieldCheck,
    badge: "2 on Free · Unlimited on Pro",
  },
];

export function FeaturesGridSection({ hideHeader = false }: { hideHeader?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFeatures =
    activeCategory === "all"
      ? features
      : features.filter((f) => f.category === activeCategory);

  return (
    <section id="features" className="scroll-mt-32 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        {!hideHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky">Capabilities</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.12 }}
            >
              From personal assistant to AI CFO
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              Ryport interprets your data, surfaces actionable insights, and evolves with your financial needs.
            </p>
          </div>
        )}

        {/* Category Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {featureCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-brand text-white shadow-sm"
                  : "bg-paper text-mist hover:bg-sky-soft hover:text-ink"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feature Equal Square Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => {
            const IconComp = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative aspect-square flex flex-col justify-between rounded-2xl border border-line bg-paper p-7 lg:p-8 transition-all duration-300 hover:border-sky/50 hover:bg-white hover:shadow-lg hover:shadow-sky/5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-white text-brand shadow-sm border border-line/80 group-hover:bg-brand group-hover:text-white transition-colors">
                      <IconComp className="size-5" />
                    </div>
                    <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-sky">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-ink group-hover:text-brand transition-colors">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-mist">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-mist">
                  <span>Built for Nigeria</span>
                  <Link href="/pricing" className="font-semibold text-sky inline-flex items-center gap-1 group-hover:underline">
                    View plan <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
