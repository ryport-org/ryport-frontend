import {
  IllustrationAiChat,
  IllustrationBankConnect,
  IllustrationCfo,
} from "@/components/marketing/illustrations";
import { IllustrationFrame } from "@/components/marketing/illustration-frame";
import { ShieldCheck, Zap, LineChart } from "lucide-react";

const steps = [
  {
    step: "01",
    tagline: "Bank Sync Engine",
    title: "Link your Nigerian bank accounts",
    description:
      "Connect your supported bank accounts (Access, GTBank, Zenith, Kuda, Moniepoint) via Mono Open Banking. Transactions sync automatically with bank-grade security — zero manual entry.",
    Illustration: IllustrationBankConnect,
    icon: ShieldCheck,
    highlight: "AES-256 encrypted · Read-only access",
  },
  {
    step: "02",
    tagline: "Instant Intelligence",
    title: "Let AI categorise every naira",
    description:
      "Food, fuel, school fees, market stock, generator power, subscription renewals — instantly tagged and organized. Ask Ryport anything in plain English like 'How much went to fuel this month?'",
    Illustration: IllustrationAiChat,
    icon: Zap,
    highlight: "Sub-second AI classification",
  },
  {
    step: "03",
    tagline: "Evolving OS",
    title: "Scale from personal assistant to AI CFO",
    description:
      "Set category budgets, track cash runway, and forecast upcoming obligations. For SMBs and agencies, unlock a full AI CFO with P&L reports and runway predictions.",
    Illustration: IllustrationCfo,
    icon: LineChart,
    highlight: "Budgets · Cashflow · P&L Forecasts",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-32 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky">How it works</p>
          <h2
            className="mt-3 font-display text-ink"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1.12 }}
          >
            Three steps to complete financial control
          </h2>
          <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
            Designed for how money actually moves in Nigeria — fast setup, automatic sync, and human-readable insights.
          </p>
        </div>

        {/* Stepper Timeline Container */}
        <div className="relative mt-16 lg:mt-24">
          {/* Vertical Center Spine Line (Desktop) */}
          <div
            className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-0.5 -translate-x-1/2 bg-gradient-to-b from-sky/20 via-sky to-brand/20"
            aria-hidden="true"
          />

          <div className="space-y-16 lg:space-y-24">
            {steps.map((item, idx) => {
              const isEven = idx % 2 === 1;
              const IconComp = item.icon;

              return (
                <div
                  key={item.step}
                  className={`relative grid gap-8 items-center lg:grid-cols-12 ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Step Visual / Card Frame */}
                  <div
                    className={`lg:col-span-6 ${
                      isEven ? "lg:order-2 lg:pl-8" : "lg:order-1 lg:pr-8"
                    }`}
                  >
                    <div className="group relative rounded-2xl border border-line bg-paper p-4 transition-all duration-300 hover:border-sky/40 hover:shadow-[0_8px_30px_rgba(61,139,255,0.08)]">
                      <IllustrationFrame variant="white" className="w-full">
                        <item.Illustration />
                      </IllustrationFrame>
                      <div className="mt-3 flex items-center justify-between px-2 py-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky">
                          <IconComp className="size-3.5" />
                          {item.highlight}
                        </span>
                        <span className="font-mono text-xs font-bold text-mist">Stage 0{idx + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Central Node Marker (Desktop) */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 size-12 items-center justify-center rounded-full border-4 border-white bg-brand font-mono text-sm font-bold text-white shadow-md shadow-brand/25 z-10">
                    {item.step}
                  </div>

                  {/* Step Description */}
                  <div
                    className={`lg:col-span-6 ${
                      isEven ? "lg:order-1 lg:text-right lg:pr-12" : "lg:order-2 lg:pl-12"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-sky">
                      {item.tagline}
                    </p>

                    <h3 className="mt-2 font-display text-2xl text-ink lg:text-3xl">
                      {item.title}
                    </h3>

                    <p className="mt-4 text-sm leading-relaxed text-mist lg:text-base">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
