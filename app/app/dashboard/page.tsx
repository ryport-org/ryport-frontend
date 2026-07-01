"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "@/components/marketing/sparkline";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { AiInsightCard, TransactionList } from "@/components/dashboard/transaction-list";
import { BudgetProgressList } from "@/components/dashboard/budget-progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import {
  accountsApi,
  aiApi,
  budgetsApi,
  normalizeTransactions,
  notificationsApi,
  transactionsApi,
} from "@/lib/api";
import type { BankAccount, Budget, BudgetUsage, Transaction } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export default function DashboardPage() {
  const { canUse, plan } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<(Budget & { usage?: BudgetUsage })[]>([]);
  const [runwayDays, setRunwayDays] = useState<number | null>(null);
  const [aiQuota, setAiQuota] = useState<{ remaining: number; limit: number } | null>(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;
    const authToken = accessToken;

    async function load() {
      try {
        const [accts, txPage, budgetList, quota] = await Promise.all([
          accountsApi.list(authToken).catch(() => []),
          transactionsApi.list(authToken, { page_size: 50 }).catch(() => ({
            results: [],
            next: null,
            previous: null,
            page_size: 50,
          })),
          budgetsApi.list(authToken).catch(() => []),
          aiApi.quota(authToken).catch(() => null),
        ]);

        setAccounts(accts);
        const txns = normalizeTransactions(txPage);
        setTransactions(txns.slice(0, 8));
        if (quota) setAiQuota({ remaining: quota.remaining, limit: quota.limit });

        const usageResults = await Promise.all(
          budgetList.slice(0, 4).map(async (b) => {
            try {
              const usage = await budgetsApi.usage(authToken, b.id);
              return { ...b, usage };
            } catch {
              return b;
            }
          }),
        );
        setBudgets(usageResults);

        if (canUse("cash_flow_prediction")) {
          try {
            const cashFlow = await aiApi.cashFlowPredict(authToken, 30);
            if (cashFlow.days_until_low != null) setRunwayDays(cashFlow.days_until_low);
          } catch {
            /* Pro+ feature */
          }
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [canUse]);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount_kobo, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount_kobo, 0);
  const netPosition = income - expenses;

  return (
    <AppPage>
      <AppHeader title="Dashboard" description="Your financial overview at a glance" />

      <AppPageBody>
      <AppPageContent>
        {plan?.plan === "free" ? (
          <Card className="border-brand/20 bg-sky-soft/30">
            <CardBody className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink">Unlock unlimited AI, exports, and cash flow forecasts.</p>
              <Button href="/app/upgrade" variant="primary">Upgrade</Button>
            </CardBody>
          </Card>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            <Card className="overflow-hidden">
              <CardBody className="relative">
                <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
                  <Sparkline />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-mist">Net position (30d)</p>
                  <p
                    className="mt-2 font-display tabular-nums text-ink"
                    style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", lineHeight: 1 }}
                  >
                    {formatNaira(netPosition)}
                  </p>
                  <p className="mt-2 text-sm text-mist">
                    {accounts.length} linked account{accounts.length !== 1 ? "s" : ""}
                    {runwayDays != null && runwayDays < 14
                      ? ` · Low balance in ${runwayDays} days`
                      : ""}
                  </p>
                </div>
              </CardBody>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Income (recent)" value={formatNaira(income)} change={income > 0 ? "↑" : undefined} />
              <StatCard label="Expenses (recent)" value={formatNaira(expenses)} changePositive={false} />
              <StatCard label="Linked accounts" value={String(accounts.length)} />
              <StatCard
                label="AI messages left"
                value={aiQuota ? (aiQuota.limit < 0 ? "∞" : String(aiQuota.remaining)) : "—"}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <h2 className="text-sm font-semibold text-ink">Recent transactions</h2>
                </CardHeader>
                <TransactionList transactions={transactions} />
              </Card>

              <div className="space-y-6">
                <AiInsightCard insight="Ask Ryport where your money went this month — food, transport, and subscriptions are categorised automatically from your linked accounts." />
                <Card>
                  <CardHeader>
                    <h2 className="text-sm font-semibold text-ink">Budgets</h2>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <BudgetProgressList budgets={budgets} />
                  </CardBody>
                </Card>
              </div>
            </div>
          </>
        )}
      </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
