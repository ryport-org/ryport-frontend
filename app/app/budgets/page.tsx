"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { BudgetProgressList } from "@/components/dashboard/budget-progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { budgetsApi } from "@/lib/api";
import type { Budget, BudgetUsage } from "@/lib/api/types";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<(Budget & { usage?: BudgetUsage })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const list = await budgetsApi.list(token);
      const withUsage = await Promise.all(
        list.map(async (b) => {
          try {
            return { ...b, usage: await budgetsApi.usage(token, b.id) };
          } catch {
            return b;
          }
        }),
      );
      setBudgets(withUsage);
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
    setError("");
    try {
      await budgetsApi.create(token, {
        name: String(fd.get("name")),
        category: String(fd.get("category")),
        limit_kobo: Math.round(Number(fd.get("limit")) * 100),
        period: String(fd.get("period")),
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  return (
    <>
      <AppHeader
        title="Budgets"
        description="Set limits and get alerts before you overspend"
        action={
          <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New budget"}
          </Button>
        }
      />

      <div className="space-y-6 p-6 sm:p-8">
        {showForm ? (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink">Name</label>
                <Input name="name" required placeholder="Food budget" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Category</label>
                <Input name="category" required placeholder="Food" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Limit (₦)</label>
                <Input name="limit" type="number" min="0" required className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Period</label>
                <select name="period" className={`${inputClassName} mt-1.5`}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {error ? <p className="text-sm text-coral-warn sm:col-span-2">{error}</p> : null}
              <div className="sm:col-span-2">
                <Button type="submit">Create budget</Button>
              </div>
            </form>
          </Card>
        ) : null}

        {loading ? (
          <Skeleton className="h-48" />
        ) : (
          <BudgetProgressList budgets={budgets} />
        )}
      </div>
    </>
  );
}
