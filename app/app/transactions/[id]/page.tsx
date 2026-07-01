"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { transactionsApi, aiApi } from "@/lib/api";
import type { Transaction } from "@/lib/api/types";
import { formatDate, formatNaira } from "@/lib/format";
import { useAuth, getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { canUse } = useAuth();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    transactionsApi.get(token, id).then(setTx).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    const token = getAccessToken();
    if (!token || !id || !confirm("Delete this transaction?")) return;
    await transactionsApi.remove(token, id);
    router.push("/app/transactions");
  }

  async function handleCategorise() {
    const token = getAccessToken();
    if (!token || !id) return;
    try {
      setTx(await transactionsApi.categorise(token, id));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function handleAiCategorise() {
    const token = getAccessToken();
    if (!token || !id) return;
    try {
      await aiApi.categoriseTransaction(token, id);
      setTx(await transactionsApi.get(token, id));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function handleReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const token = getAccessToken();
    const file = e.target.files?.[0];
    if (!token || !id || !file) return;
    try {
      setTx(await transactionsApi.uploadReceipt(token, id, file));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <AppPage>
        <AppHeader title="Transaction" />
        <AppPageBody>
          <AppPageContent>
            <Skeleton className="h-48" />
          </AppPageContent>
        </AppPageBody>
      </AppPage>
    );
  }

  if (!tx) {
    return (
      <AppPage>
        <AppHeader title="Transaction not found" />
        <AppPageBody>
          <div className="p-6">
            <Button onClick={() => router.push("/app/transactions")}>Back</Button>
          </div>
        </AppPageBody>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppHeader
        title={tx.merchant || tx.description || "Transaction"}
        description={formatDate(tx.transaction_date)}
        action={
          <Button variant="ghost" className="text-coral-warn" onClick={handleDelete}>
            <Trash2 className="size-4" /> Delete
          </Button>
        }
      />
      <AppPageBody>
        <AppPageContent>
          <Card>
            <CardBody className="space-y-4">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-mist">Amount</span>
                <span className="text-lg font-semibold tabular-nums text-ink">
                  {formatNaira(tx.amount_kobo)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-mist">Type</span>
                <span className="text-sm capitalize text-ink">{tx.type}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-mist">Category</span>
                <span className="text-sm text-ink">{tx.category}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-mist">Description</span>
                <span className="text-sm text-ink">{tx.description || "—"}</span>
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleCategorise}>Auto-categorise</Button>
            <Button variant="secondary" onClick={handleAiCategorise}>AI categorise</Button>
            {canUse("receipt_scanner") ? (
              <label className="cursor-pointer">
                <span className="inline-flex h-9 items-center rounded-lg border border-line px-4 text-sm font-medium hover:bg-paper">
                  Upload receipt
                </span>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceipt} />
              </label>
            ) : null}
          </div>
          {error ? <p className="text-sm text-coral-warn">{error}</p> : null}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
