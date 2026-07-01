import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Transaction } from "@/lib/api/types";
import { formatNaira, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type TransactionListProps = {
  transactions: Transaction[];
  emptyMessage?: string;
};

export function TransactionList({
  transactions,
  emptyMessage = "No transactions yet. Link a bank account or add one manually.",
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm text-mist">{emptyMessage}</p>
        <Link
          href="/app/accounts"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline"
        >
          Connect account <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {transactions.map((tx) => {
        const isIncome = tx.type === "income";
        return (
          <li key={tx.id}>
            <Link
              href={`/app/transactions/${tx.id}`}
              className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-paper sm:items-center sm:gap-4 sm:px-6 sm:py-4"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:size-10",
                  isIncome ? "bg-sky-soft text-sky" : "bg-paper text-ink",
                )}
              >
                {isIncome ? "+" : "−"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 sm:block">
                  <p className="line-clamp-2 text-sm font-medium text-ink sm:truncate">
                    {tx.description || tx.merchant || tx.category || "Transaction"}
                  </p>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums sm:hidden",
                      isIncome ? "text-sky" : "text-ink",
                    )}
                  >
                    {formatNaira(tx.amount_kobo, { showSign: isIncome })}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-mist">
                  {tx.category ?? "Uncategorised"} ·{" "}
                  {formatRelativeDate(tx.transaction_date ?? (tx as { date?: string }).date ?? "")}
                </p>
              </div>
              <p
                className={cn(
                  "hidden shrink-0 text-sm font-semibold tabular-nums sm:block",
                  isIncome ? "text-sky" : "text-ink",
                )}
              >
                {formatNaira(tx.amount_kobo, { showSign: isIncome })}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AiInsightCard({ insight }: { insight: string }) {
  return (
    <div className="rounded-xl border border-sky/20 bg-sky-soft/50 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-sky" />
        <p className="text-xs font-semibold uppercase tracking-wide text-sky">
          AI insight
        </p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink">{insight}</p>
      <Link
        href="/app/ai"
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline"
      >
        Ask Ryport AI <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
