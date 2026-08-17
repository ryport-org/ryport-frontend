import { pillars } from "@/lib/pricing-data";
import {
  IllustrationGrow,
  IllustrationManage,
  IllustrationUnderstand,
} from "@/components/marketing/illustrations";
import { IllustrationFrame } from "@/components/marketing/illustration-frame";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const pillarIllustrations = [
  IllustrationUnderstand,
  IllustrationManage,
  IllustrationGrow,
];

export function BenefitsSection({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <section id="pillars" className="scroll-mt-32 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        {!hideHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky">Why Ryport</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.12 }}
            >
              Smart Financial Operating System
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              Automated accounting, proactive budget controls, and AI CFO insights built to scale with your financial growth.
            </p>
          </div>
        )}

        {/* 3-Pillar Bento Layout */}
        <div className={`grid gap-8 lg:grid-cols-12 ${hideHeader ? "" : "mt-16"}`}>
          {/* Bento Hero Card (Pillar 1: Understand) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-line bg-gradient-to-br from-paper via-white to-sky-soft/40 p-8 lg:p-10 shadow-sm transition-all hover:border-sky/40 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  <Sparkles className="size-3.5" />
                  Pillar 01 · Understand
                </span>
                <span className="font-mono text-xs font-bold text-mist">Core Foundation</span>
              </div>

              <h3 className="mt-6 font-display text-2xl text-ink lg:text-3xl">
                {pillars[0].title}: Know where every naira goes
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-mist lg:text-base">
                {pillars[0].description} Automatic classification of food, fuel, school fees, and business inventory without manual spreadsheet entry.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-line/80 bg-white p-4 shadow-sm">
              <IllustrationFrame variant="white">
                <IllustrationUnderstand />
              </IllustrationFrame>
            </div>
          </div>

          {/* Right Column: Stacked Bento Cards (Pillars 2 & 3: Manage & Grow) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Pillar 2: Manage */}
            <div className="flex-1 flex flex-col justify-between rounded-3xl border border-line bg-paper p-8 shadow-sm transition-all hover:border-sky/40 hover:bg-white">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-sky">
                    Pillar 02 · Manage
                  </span>
                  <span className="font-mono text-xs font-bold text-mist">Proactive Control</span>
                </div>

                <h3 className="mt-4 font-display text-xl text-ink lg:text-2xl">
                  {pillars[1].title}: Smart budgets & alerts
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-mist">
                  {pillars[1].description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-line/60">
                <span className="text-xs font-medium text-mist flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" /> AES-256 Protected
                </span>
                <Link href="/features" className="inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline">
                  Learn more <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Grow */}
            <div className="flex-1 flex flex-col justify-between rounded-3xl border border-line bg-gradient-to-br from-white to-sky-soft/30 p-8 shadow-sm transition-all hover:border-sky/40">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Pillar 03 · Grow
                  </span>
                  <span className="font-mono text-xs font-bold text-mist">Scale to AI CFO</span>
                </div>

                <h3 className="mt-4 font-display text-xl text-ink lg:text-2xl">
                  {pillars[2].title}: Turn financial data into strategy
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-mist">
                  {pillars[2].description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-line/60">
                <span className="text-xs font-medium text-mist">Advanced CFO Engine</span>
                <Link href="/pricing" className="inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline">
                  Compare plans <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
