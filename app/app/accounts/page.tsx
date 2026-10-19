"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquareText, Trash2 } from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokens";
import { accountsApi } from "@/lib/api";
import type { BankAccount } from "@/lib/api/types";
import { formatDate, formatNaira } from "@/lib/format";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      setAccounts(await accountsApi.list(token));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    const token = getAccessToken();
    if (!token || !confirm("Disconnect this account?")) return;
    await accountsApi.remove(token, id);
    await load();
  }

  return (
    <AppPage>
      <AppHeader
        title="Bank accounts"
        description="Manage connected accounts and bank data sources"
      />

      <AppPageBody>
        <AppPageContent>
          <Card className="border-sky/20 bg-sky-soft/20 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky text-white shadow-sm">
                  <ArrowRight className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    Primary Data Entry: Manual & Receipt Capture
                  </h2>
                  <p className="mt-1 text-xs text-mist">
                    Direct open banking sync and SMS ingestion are temporarily paused. Cash balances and reports are computed directly from recorded transactions.
                  </p>
                </div>
              </div>
              <Button href="/app/transactions?new=1" variant="primary" className="whitespace-nowrap">
                Record Transaction <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </div>
          </Card>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : accounts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-sm text-mist">No external bank feeds connected.</p>
              <p className="mt-1 text-xs text-mist">Your balances and metrics are calculated automatically from manual entries and receipt uploads.</p>
              <Link
                href="/app/transactions?new=1"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"
              >
                Record your first transaction <ArrowRight className="size-3.5" />
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {accounts.map((acct) => (
                <Card key={acct.id}>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-mist">
                        {acct.bank_name}
                      </p>
                      <span className="rounded-full bg-paper border border-line px-2 py-0.5 text-[10px] font-medium text-mist">
                        Sync Paused
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-ink">{acct.account_name}</p>
                    <p className="text-xs text-mist">
                      {acct.masked_account_number ?? "****"}
                    </p>
                    {acct.balance_kobo != null ? (
                      <p className="mt-4 font-display text-2xl tabular-nums text-ink">
                        {formatNaira(acct.balance_kobo)}
                      </p>
                    ) : null}
                    {acct.connected_at ? (
                      <p className="mt-1 text-xs text-mist">
                        Connected {formatDate(acct.connected_at)}
                      </p>
                    ) : null}
                    <div className="mt-4 flex gap-2">
                      <span className="inline-flex items-center rounded-lg border border-line bg-paper px-3 py-1.5 text-xs text-mist cursor-not-allowed">
                        Bank Sync: Coming soon
                      </span>
                      <Button
                        variant="ghost"
                        className="gap-1.5 text-coral-warn"
                        onClick={() => remove(acct.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
