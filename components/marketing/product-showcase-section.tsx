import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { IllustrationAiChat } from "@/components/marketing/illustrations";
import { IllustrationFrame } from "@/components/marketing/illustration-frame";

export function ProductShowcaseSection() {
  return (
    <section id="product" className="scroll-mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium text-sky">Product</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
            >
              Your dashboard. Your AI. One place.
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              Real-time balance, income, and expenses — plus an AI that explains
              what changed and what to do next.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline"
            >
              Explore dashboard <ArrowRight className="size-4" />
            </Link>
          </div>
          <DashboardPreview />
        </div>

        <div className="mt-16 grid items-center gap-10 rounded-2xl border border-line bg-white p-8 lg:grid-cols-2 lg:gap-16 lg:p-12">
          <IllustrationFrame className="mx-auto w-full max-w-sm">
            <IllustrationAiChat />
          </IllustrationFrame>
          <div>
            <p className="text-sm font-medium text-sky">AI chat</p>
            <h3 className="mt-2 font-display text-2xl text-ink">
              Ask where your money went
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              &ldquo;How much did I spend on food?&rdquo; &ldquo;What&apos;s my biggest
              expense?&rdquo; — get answers in seconds, not spreadsheets.
            </p>
            <Link
              href="/ai-insights"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline"
            >
              See AI insights <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
