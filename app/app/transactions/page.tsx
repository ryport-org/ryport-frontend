"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { getAccessToken } from "@/lib/auth/tokens";
import { normalizeTransactions, transactionsApi } from "@/lib/api";
import type { Transaction } from "@/lib/api/types";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await transactionsApi.list(token);
      setTransactions(normalizeTransactions(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
        type: String(fd.get("type")),
        category: String(fd.get("category") || ""),
        description: String(fd.get("description") || ""),
        date: String(fd.get("date")),
        idempotency_key: crypto.randomUUID(),
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AppHeader
        title="Transactions"
        description="Track every naira in and out"
        action={
          <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Add manual"}
          </Button>
        }
      />

      <div className="space-y-6 p-6 sm:p-8">
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
                <Input name="category" placeholder="Food" className="mt-1.5" />
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
            <TransactionList transactions={transactions} />
          )}
        </Card>
      </div>
    </>
  );
}
