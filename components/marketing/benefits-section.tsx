import { pillars } from "@/lib/pricing-data";
import {
  IllustrationGrow,
  IllustrationManage,
  IllustrationUnderstand,
} from "@/components/marketing/illustrations";
import { IllustrationFrame } from "@/components/marketing/illustration-frame";

const pillarIllustrations = [
  IllustrationUnderstand,
  IllustrationManage,
  IllustrationGrow,
];

export function BenefitsSection({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <section id="pillars" className="scroll-mt-32 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        {!hideHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-sky">Why Ryport</p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.5rem)", lineHeight: 1.15 }}
            >
              Built for Africa. Powered by AI.
            </h2>
            <p className="mt-4 text-mist" style={{ fontSize: "var(--text-subhead)", lineHeight: 1.6 }}>
              Paystack, Flutterwave, and local bank formats — intelligence generic
              apps can&apos;t provide.
            </p>
          </div>
        )}

        <div className={`grid gap-8 md:grid-cols-3 ${hideHeader ? "" : "mt-14"}`}>
          {pillars.map((item, i) => {
            const Illus = pillarIllustrations[i];
            return (
              <div
                key={item.title}
                className="flex flex-col gap-6 rounded-2xl border border-line bg-paper p-6 sm:p-8"
              >
                <IllustrationFrame variant="white">
                  <Illus />
                </IllustrationFrame>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
