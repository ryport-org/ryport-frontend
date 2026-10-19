"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { debtsApi } from "@/lib/api";
import type { DebtSummary } from "@/lib/api/types";
import { getAccessToken } from "@/lib/auth/tokens";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyWaitingWidgetProps {
  initialSummary?: DebtSummary | null;
  businessId?: string;
  className?: string;
}

export function MoneyWaitingWidget({
  initialSummary,
  businessId,
  className,
}: MoneyWaitingWidgetProps) {
  const [summary, setSummary] = useState<DebtSummary | null>(initialSummary ?? null);
  const [loading, setLoading] = useState(!initialSummary);

  useEffect(() => {
    if (initialSummary !== undefined) {
      setSummary(initialSummary);
      setLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    debtsApi
      .summary(token, businessId)
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch(() => {
        // Silently handle if user has no debts or network issue
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialSummary, businessId]);

  if (loading || !summary || summary.unpaid_debts_count === 0) {
    return null;
  }

  const topDebtors = summary.top_debtors ?? [];

  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs transition-all",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
          MONEY WAITING TO BE COLLECTED
        </span>
        {summary.overdue_count > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
            <AlertCircle className="size-3" />
            {summary.overdue_count} overdue
          </span>
        )}
      </div>

      <p className="my-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-amber-950">
        {formatNaira(summary.total_outstanding_kobo)}
      </p>

      <p className="text-xs font-medium text-amber-800">
        {summary.unpaid_debts_count} open {summary.unpaid_debts_count === 1 ? "debtor" : "debtors"}
        {summary.overdue_count > 0 ? ` (${summary.overdue_count} overdue)` : ""}
        {summary.due_this_week_kobo > 0
          ? ` • ${formatNaira(summary.due_this_week_kobo)} due this week`
          : ""}
      </p>

      {topDebtors.length > 0 && (
        <div className="mt-3.5 space-y-2 border-t border-amber-200/70 pt-3">
          {topDebtors.slice(0, 3).map((debtor) => (
            <div key={debtor.id} className="flex items-center justify-between text-xs sm:text-sm">
              <span className="truncate font-medium text-ink mr-2">{debtor.debtor_name}</span>
              <span
                className={cn(
                  "font-semibold tabular-nums shrink-0",
                  debtor.is_overdue ? "text-rose-600" : "text-ink",
                )}
              >
                {formatNaira(debtor.remaining_amount_kobo)}
                {debtor.is_overdue && (
                  <span className="ml-1 text-[10px] font-bold uppercase text-rose-600">
                    (overdue)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/app/debts"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline"
      >
        View All Receivables <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
