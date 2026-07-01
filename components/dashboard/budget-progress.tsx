import type { Budget, BudgetUsage } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

type BudgetWithUsage = Budget & { usage?: BudgetUsage };

export function BudgetProgressList({ budgets }: { budgets: BudgetWithUsage[] }) {
  if (budgets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-mist">
        No budgets set. Create one to track spending limits.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {budgets.map((budget) => {
        const spent = budget.usage?.spent_kobo ?? 0;
        const limit = budget.usage?.limit_kobo ?? budget.limit_kobo;
        const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
        const over = pct >= 100;

        return (
          <li key={budget.id} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{budget.name ?? budget.category}</p>
                <p className="text-xs capitalize text-mist">
                  {budget.category} · {budget.period}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {formatNaira(spent)}{" "}
                <span className="font-normal text-mist">/ {formatNaira(limit)}</span>
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  over ? "bg-coral-warn" : pct > 80 ? "bg-sky" : "bg-sky/70",
                )}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className={cn("mt-2 text-xs", over ? "text-coral-warn" : "text-mist")}>
              {over ? "Over budget" : `${pct}% used`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
