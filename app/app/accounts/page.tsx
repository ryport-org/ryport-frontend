"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { MonoConnectButton } from "@/components/accounts/mono-connect-button";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { accountsApi } from "@/lib/api";
import type { BankAccount } from "@/lib/api/types";
import { formatDate, formatNaira } from "@/lib/format";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function AccountsPage() {
  const { getLimit } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkCode, setLinkCode] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState<string | null>(null);

  const bankLimit = getLimit("bank_accounts");

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

  async function connect(code: string) {
    const token = getAccessToken();
    if (!token || !code.trim()) return;
    setError("");
    try {
      await accountsApi.connect(token, code.trim());
      setLinkCode("");
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function connectManual(e: React.FormEvent) {
    e.preventDefault();
    await connect(linkCode);
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

  const atLimit = bankLimit !== null && accounts.length >= bankLimit;

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
            Securely link your Nigerian bank account. Transactions sync automatically.
          </p>
          {bankLimit !== null ? (
            <p className="mt-2 text-xs text-mist">
              {accounts.length} of {bankLimit} accounts used
            </p>
          ) : null}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MonoConnectButton
              disabled={atLimit}
              onCode={connect}
            />
            <span className="text-xs text-mist">or paste code manually</span>
          </div>
          <form onSubmit={connectManual} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
              placeholder="Mono link code"
              className="flex-1"
              disabled={atLimit}
            />
            <Button type="submit" disabled={atLimit}>Connect</Button>
          </form>
          {error ? <p className="mt-2 text-sm text-coral-warn">{error}</p> : null}
          {atLimit ? (
            <p className="mt-2 text-sm text-coral-warn">
              Account limit reached. Upgrade to link more banks.
            </p>
          ) : null}
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
