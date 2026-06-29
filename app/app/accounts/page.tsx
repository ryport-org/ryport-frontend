"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/auth/tokens";
import { accountsApi } from "@/lib/api";
import type { BankAccount } from "@/lib/api/types";
import { formatDate, formatNaira } from "@/lib/format";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkCode, setLinkCode] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState<string | null>(null);

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

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !linkCode.trim()) return;
    setError("");
    try {
      await accountsApi.connect(token, linkCode.trim());
      setLinkCode("");
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function sync(id: string) {
    const token = getAccessToken();
    if (!token) return;
    setSyncing(id);
    try {
      await accountsApi.sync(token, id);
      await load();
    } finally {
      setSyncing(null);
    }
  }

  async function remove(id: string) {
    const token = getAccessToken();
    if (!token || !confirm("Disconnect this account?")) return;
    await accountsApi.remove(token, id);
    await load();
  }

  return (
    <>
      <AppHeader
        title="Bank accounts"
        description="Link Nigerian accounts via Mono open banking"
      />

      <div className="space-y-6 p-6 sm:p-8">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-ink">Connect via Mono</h2>
          <p className="mt-1 text-sm text-mist">
            Paste the link code from Mono after authorising your bank.
          </p>
          <form onSubmit={connect} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
              placeholder="Mono link code"
              className="flex-1"
            />
            <Button type="submit">Connect account</Button>
          </form>
          {error ? <p className="mt-2 text-sm text-coral-warn">{error}</p> : null}
        </Card>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-sm text-mist">No accounts linked yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map((acct) => (
              <Card key={acct.id}>
                <CardBody>
                  <p className="text-xs font-medium uppercase tracking-wide text-mist">
                    {acct.bank_name}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink">{acct.account_name}</p>
                  <p className="text-xs text-mist">
                    •••• {acct.account_number_masked?.slice(-4) ?? "****"}
                  </p>
                  <p className="mt-4 font-display text-2xl tabular-nums text-ink">
                    {formatNaira(acct.balance_kobo)}
                  </p>
                  {acct.last_synced_at ? (
                    <p className="mt-1 text-xs text-mist">
                      Synced {formatDate(acct.last_synced_at)}
                    </p>
                  ) : null}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => sync(acct.id)}
                      disabled={syncing === acct.id}
                    >
                      <RefreshCw className={`size-3.5 ${syncing === acct.id ? "animate-spin" : ""}`} />
                      Sync
                    </Button>
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
      </div>
    </>
  );
}
