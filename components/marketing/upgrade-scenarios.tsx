import { upgradeScenarios } from "@/lib/pricing-data";
import { UserCheck, Sparkles, Building } from "lucide-react";

const scenarioIcons = [UserCheck, Sparkles, Building];

export function UpgradeScenarios() {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky">Use Cases</p>
          <h2 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
            Which plan matches your financial situation?
          </h2>
          <p className="mt-3 text-sm text-mist">
            Real Nigerian scenarios showing how Ryport evolves with you over time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {upgradeScenarios.map((item, idx) => {
            const IconComp = scenarioIcons[idx] || UserCheck;
            return (
              <div
                key={item.name}
                className="aspect-square flex flex-col justify-between rounded-3xl border border-line bg-paper p-8 lg:p-10 transition-all hover:border-sky/40 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1 text-xs font-bold text-sky">
                      <IconComp className="size-3.5" />
                      {item.plan} Tier
                    </span>
                    <span className="font-mono text-xs text-mist">Scenario 0{idx + 1}</span>
                  </div>

                  <h3 className="mt-6 font-display text-2xl text-ink font-semibold">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-mist">{item.role}</p>

                  <p className="mt-4 text-sm leading-relaxed text-mist">
                    {item.story}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-mist/80 italic">
                  <span>Illustrative scenario</span>
                  <span className="font-semibold not-italic text-sky">Learn more →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
