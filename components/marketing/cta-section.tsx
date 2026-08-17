import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B0E1A] py-24 text-white">
      {/* Background Glowing Radial Mesh */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-radial from-brand/40 via-sky/20 to-transparent blur-3xl opacity-60"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-4 py-1.5 text-xs font-semibold text-sky backdrop-blur-md">
          <Sparkles className="size-3.5 text-sky" />
          <span>Built for Nigerian Individuals & Businesses</span>
        </div>

        <h2
          className="mx-auto mt-6 max-w-3xl font-display text-white"
          style={{ fontSize: "clamp(2.25rem, 4vw + 0.5rem, 3.5rem)", lineHeight: 1.1 }}
        >
          Start free. Grow with intelligence.
        </h2>

        <p
          className="mx-auto mt-4 max-w-2xl text-slate-300"
          style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}
        >
          Your AI-powered financial operating system — from pocket money tracking to full AI CFO profit &amp; loss analysis.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            href="/register"
            className="min-w-[220px] rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/40 hover:bg-brand/90 transition-all"
          >
            Start free — ₦0/mo
          </Button>
          <Button
            href="/pricing"
            variant="ghost"
            className="min-w-[220px] rounded-full border border-slate-700 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-slate-500 transition-all"
          >
            Explore all plans
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" /> Free forever plan (2 accounts)
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-sky" /> Mono Open Banking AES-256
          </span>
          <span className="hidden sm:inline">•</span>
          <span>No credit card required to start</span>
        </div>
      </div>
    </section>
  );
}
