import { Check, Minus } from "lucide-react";
import { comparisonRows } from "@/lib/pricing-data";
import type { ComparisonCell } from "@/lib/pricing-data";

function Cell({ value }: { value: ComparisonCell }) {
  if (value === true) {
    return <Check className="mx-auto size-4 text-sky" aria-label="Included" />;
  }
  if (value === false) {
    return <Minus className="mx-auto size-4 text-mist/50" aria-label="Not included" />;
  }
  return <span className="text-xs font-medium text-ink sm:text-sm">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl text-ink">Feature comparison</h2>
          <p className="mt-2 text-sm text-mist">See what&apos;s included in each plan.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-4 py-3 font-medium text-mist">Feature</th>
                <th className="px-4 py-3 text-center font-semibold text-ink">Free</th>
                <th className="px-4 py-3 text-center font-semibold text-sky">Pro</th>
                <th className="px-4 py-3 text-center font-semibold text-ink">Advanced</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => {
                if (row.group) {
                  return (
                    <tr key={row.group} className="border-b border-line bg-sky-soft/40">
                      <td colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky">
                        {row.group}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={`${row.feature}-${i}`} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-ink">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      <Cell value={row.free} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Cell value={row.pro} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Cell value={row.advanced} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
