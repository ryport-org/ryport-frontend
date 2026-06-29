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
      <div className="flex flex-col items-center justify-center py-12 text-center">
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
              href={`/app/transactions?id=${tx.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper sm:px-6"
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isIncome ? "bg-sky-soft text-sky" : "bg-paper text-ink",
                )}
              >
                {isIncome ? "+" : "−"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {tx.description || tx.merchant || tx.category || "Transaction"}
                </p>
                <p className="mt-0.5 text-xs text-mist">
                  {tx.category ?? "Uncategorised"} · {formatRelativeDate(tx.date)}
                </p>
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
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
    <div className="rounded-xl border border-sky/20 bg-sky-soft/50 p-5">
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
