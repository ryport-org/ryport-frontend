import {
  IllustrationAiChat,
  IllustrationBankConnect,
  IllustrationCfo,
} from "@/components/marketing/illustrations";
import { IllustrationFrame } from "@/components/marketing/illustration-frame";

const steps = [
  {
    step: "01",
    title: "Connect your bank",
    description:
      "Link a supported Nigerian account. Transactions sync automatically — no manual imports.",
    Illustration: IllustrationBankConnect,
  },
  {
    step: "02",
    title: "Let AI categorise",
    description:
      "Food, transport, business, utilities — classified instantly. Ask anything in plain English.",
    Illustration: IllustrationAiChat,
  },
  {
    step: "03",
    title: "Grow with intelligence",
    description:
      "Budgets, cash flow forecasts, and on Advanced — a full AI CFO with runway and P&L.",
    Illustration: IllustrationCfo,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-32 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-sky">How it works</p>
          <h2
            className="mt-3 font-display text-ink"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
          >
            Three steps to financial clarity
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="flex flex-col gap-5">
              <IllustrationFrame>
                <item.Illustration />
              </IllustrationFrame>
              <div>
                <span className="text-xs font-semibold text-sky">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
