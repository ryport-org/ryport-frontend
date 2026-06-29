import { upgradeScenarios } from "@/lib/pricing-data";

export function UpgradeScenarios() {
  return (
    <section className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-2xl text-ink">Why upgrade?</h2>
          <p className="mt-2 text-sm text-mist">Real people, real financial turning points.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {upgradeScenarios.map((item) => (
            <div key={item.name} className="rounded-xl border border-line bg-white p-6">
              <span className="inline-flex rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-semibold text-sky">
                {item.plan}
              </span>
              <h3 className="mt-3 font-semibold text-ink">{item.name}</h3>
              <p className="text-xs text-mist">{item.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-mist">{item.story}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
