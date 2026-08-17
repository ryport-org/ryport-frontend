"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, MessageSquareText, TrendingUp, ShieldCheck, Check } from "lucide-react";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

const tabViews = [
  {
    id: "overview",
    label: "Financial Overview",
    icon: LayoutDashboard,
    headline: "Real-time visibility across all your accounts",
    description:
      "See your total net position, monthly income, recent transactions, and category spending updated instantly as money moves.",
    features: [
      "Mono Open Banking & Paystack automated sync",
      "Unified balance across GTBank, Access, Zenith, and Kuda",
      "Categorised transaction logs with search & tags",
    ],
  },
  {
    id: "ai-chat",
    label: "AI Chat Assistant",
    icon: MessageSquareText,
    headline: "Ask your money questions in plain English",
    description:
      "No complex formulas or Excel exports. Just type what you want to know and Ryport instantly analyzes your ledger.",
    features: [
      "\"How much did I spend on food and dining this month?\"",
      "\"What is my estimated take-home income after expenses?\"",
      "\"Flag any subscription renewals due this week\"",
    ],
  },
  {
    id: "cash-flow",
    label: "Cash Flow & Runway",
    icon: TrendingUp,
    headline: "Predict runway & upcoming obligations",
    description:
      "Whether planning for school fees, rent, or business inventory, Ryport projects your future balance based on income frequency.",
    features: [
      "Forward-looking cash flow projections (30, 60, 90 days)",
      "Automated alerts before low-balance thresholds",
      "AI CFO scenario modeling for business runway",
    ],
  },
];

export function ProductShowcaseSection() {
  const [activeTabId, setActiveTabId] = useState("overview");
  const activeTab = tabViews.find((t) => t.id === activeTabId) || tabViews[0];

  return (
    <section id="product" className="scroll-mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky">Product Workspace</p>
          <h2
            className="mt-3 font-display text-ink"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.12 }}
          >
            Your complete financial cockpit
          </h2>
          <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
            Every account, transaction, and AI prediction — organized inside one clear, intuitive workspace.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm">
            {tabViews.map((tab) => {
              const IconComp = tab.icon;
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand text-white shadow-md shadow-brand/20 font-semibold"
                      : "text-mist hover:text-ink hover:bg-paper"
                  }`}
                >
                  <IconComp className="size-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Display Grid */}
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Interactive Info */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky uppercase tracking-wide">
              <ShieldCheck className="size-3.5" />
              Verified Ryport Core Engine
            </span>

            <h3 className="mt-4 font-display text-2xl text-ink lg:text-3xl leading-snug">
              {activeTab.headline}
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-mist lg:text-base">
              {activeTab.description}
            </p>

            <ul className="mt-6 space-y-3">
              {activeTab.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-soft text-sky">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand/20 hover:bg-brand/90 transition-colors"
              >
                Launch live demo <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-1 text-sm font-medium text-mist hover:text-ink transition-colors"
              >
                View all capabilities
              </Link>
            </div>
          </div>

          {/* Right Column: Live Interactive Mockup */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-line bg-white p-3 shadow-xl shadow-ink/5">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
