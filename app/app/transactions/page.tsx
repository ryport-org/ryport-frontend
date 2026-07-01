"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { getAccessToken } from "@/lib/auth/tokens";
import {
  extractCursor,
  normalizeTransactions,
  transactionsApi,
} from "@/lib/api";
import type { Transaction, TransactionType } from "@/lib/api/types";
import type { TransactionFilters } from "@/lib/api/transactions";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Business",
  "Education",
  "Uncategorised",
] as const;

const PAGE_SIZE = 50;

function TransactionsPageInner() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(searchParams.get("new") === "1");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    page_size: PAGE_SIZE,
  });

  const loadPage = useCallback(
    async (cursor?: string, append = false) => {
      const token = getAccessToken();
      if (!token) return;

      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const data = await transactionsApi.list(token, {
          ...filters,
          cursor,
        });
        const batch = normalizeTransactions(data);
        setTransactions((prev) => (append ? [...prev, ...batch] : batch));
        setNextCursor(extractCursor(data.next));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    setError("");
    try {
      await transactionsApi.create(token, {
        amount_kobo: Math.round(Number(fd.get("amount")) * 100),
        type: String(fd.get("type")) as TransactionType,
        category: String(fd.get("category") || "Uncategorised"),
        description: String(fd.get("description") || ""),
        merchant: String(fd.get("merchant") || fd.get("description") || ""),
        transaction_date: new Date(String(fd.get("date"))).toISOString(),
        idempotency_key: crypto.randomUUID(),
      });
      setShowForm(false);
      await loadPage();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFilters({
      page_size: PAGE_SIZE,
      date_from: String(fd.get("date_from") || "") || undefined,
      date_to: String(fd.get("date_to") || "") || undefined,
      category: String(fd.get("category") || "") || undefined,
      type: (String(fd.get("type") || "") || undefined) as TransactionType | undefined,
    });
  }

  function clearFilters() {
    setFilters({ page_size: PAGE_SIZE });
  }

  return (
    <AppPage>
      <AppHeader
        title="Transactions"
        description="Track every naira in and out"
        action={
          <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Add manual"}
          </Button>
        }
      />

      <AppPageBody>
      <AppPageContent>
        <Card className="p-4 sm:p-5">
          <form onSubmit={applyFilters} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-xs font-medium text-mist">From</label>
              <Input
                name="date_from"
                type="date"
                defaultValue={filters.date_from}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mist">To</label>
              <Input
                name="date_to"
                type="date"
                defaultValue={filters.date_to}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mist">Category</label>
              <select
                name="category"
                defaultValue={filters.category ?? ""}
                className={`${inputClassName} mt-1`}
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-mist">Type</label>
              <select
                name="type"
                defaultValue={filters.type ?? ""}
                className={`${inputClassName} mt-1`}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="secondary" className="flex-1">
                Filter
              </Button>
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </form>
        </Card>

        {showForm ? (
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-ink">New transaction</h2>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink">Amount (₦)</label>
                <Input name="amount" type="number" min="0" step="0.01" required className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Type</label>
                <select name="type" required className={`${inputClassName} mt-1.5`}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Category</label>
                <select name="category" defaultValue="Uncategorised" className={`${inputClassName} mt-1.5`}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Date</label>
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-ink">Description</label>
                <Input name="description" placeholder="Lunch at Terra Kulture" className="mt-1.5" />
              </div>
              {error ? <p className="text-sm text-coral-warn sm:col-span-2">{error}</p> : null}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save transaction"}
                </Button>
              </div>
            </form>
          </Card>
        ) : null}

        <Card>
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <>
              <TransactionList transactions={transactions} />
              {nextCursor ? (
                <div className="border-t border-line p-4 text-center">
                  <Button
                    variant="secondary"
                    onClick={() => loadPage(nextCursor, true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </Button>
                </div>
              ) : transactions.length > 0 ? (
                <p className="border-t border-line py-4 text-center text-xs text-mist">
                  End of list
                </p>
              ) : null}
            </>
          )}
        </Card>
      </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="mt-6 h-64" />
        </div>
      }
    >
      <TransactionsPageInner />
    </Suspense>
  );
}
