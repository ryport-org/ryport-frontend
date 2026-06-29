import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/marketing/hero-illustration";
import { HeroSkyBackground } from "@/components/marketing/hero-sky-background";
import { LandingSectionNav } from "@/components/marketing/landing-section-nav";

const quickStats = [
  { value: "₦0", label: "to start" },
  { value: "1", label: "bank on free" },
  { value: "10", label: "AI chats/day" },
];

export function HeroSection() {
  return (
    <>
      <section
        id="hero"
        className="relative -mt-[4.5rem] overflow-hidden border-b border-line sm:-mt-20"
      >
        <HeroSkyBackground />

        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-24 text-center sm:px-8 sm:pt-28 lg:px-10 lg:pt-32">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full bg-ink p-1 text-xs font-medium text-white shadow-sm">
              <span className="px-3 py-1.5">Built for Nigeria</span>
              <span className="rounded-full bg-white px-3 py-1.5 text-ink">
                Paystack · Flutterwave · local banks
              </span>
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mx-auto mt-8 max-w-3xl font-display text-ink"
            style={{
              fontSize: "clamp(2.5rem, 5.5vw + 0.5rem, 4.5rem)",
              lineHeight: 1.08,
            }}
          >
            Know where every naira goes
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-mist"
            style={{ fontSize: "clamp(1.0625rem, 1vw + 0.9rem, 1.25rem)", lineHeight: 1.65 }}
          >
            From payday to school fees — Ryport tracks, categorises, and explains
            your money. Start as a personal assistant. Scale to an AI CFO.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/register"
              className="min-w-[200px] rounded-full px-8 shadow-[0_4px_20px_rgba(19,23,31,0.15)]"
            >
              Start free — ₦0/mo
            </Button>
            <Button
              href="#how-it-works"
              variant="ghost"
              className="min-w-[200px] rounded-full border border-line bg-white px-8 text-ink shadow-[0_2px_12px_rgba(19,23,31,0.06)] hover:bg-paper"
            >
              <Play className="mr-1.5 size-3.5 fill-current" aria-hidden="true" />
              See how it works
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mx-auto mt-10 flex max-w-md justify-center gap-8 sm:gap-12">
            {quickStats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl tabular-nums text-ink">{s.value}</p>
                <p className="mt-0.5 text-xs text-mist">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { href: "#product", label: "Dashboard" },
              { href: "#features", label: "AI insights" },
              { href: "/pricing", label: "Plans" },
              { href: "/solutions/freelancers", label: "Freelancers" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-mist transition-colors hover:border-sky hover:text-sky"
              >
                {link.label}
                <ArrowRight className="size-3" />
              </Link>
            ))}
          </div>
        </div>

        {/* Browser mockup — wide, outside narrow text column */}
        <div className="relative z-10 mx-auto mt-16 max-w-7xl px-4 pb-20 sm:px-6 lg:mt-24 lg:px-8 lg:pb-28">
          <HeroIllustration />
        </div>
      </section>

      <LandingSectionNav />
    </>
  );
}
