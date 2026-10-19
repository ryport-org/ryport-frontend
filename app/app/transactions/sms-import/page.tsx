"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/auth/tokens";
import { transactionsApi } from "@/lib/api";
import type { SmsIngestData } from "@/lib/api/types";
import { formatDate, formatKobo } from "@/lib/format";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

const SUPPORTED_BANKS = [
  "Access",
  "GTBank",
  "Zenith",
  "UBA",
  "First Bank",
  "Kuda",
  "OPay",
];

export default function SmsImportPage() {
  const [rawText, setRawText] = useState("");
  const [sender, setSender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmsIngestData | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;

    const token = getAccessToken();
    if (!token) {
      setError("Please log in to import transactions.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await transactionsApi.smsIngest(token, {
        raw_text: rawText.trim(),
        sender: sender.trim() || undefined,
        received_at: new Date().toISOString(),
      });
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("paused") || msg.includes("feature_paused") || msg.includes("503")) {
        setError("SMS import is currently paused. Please use manual entry or receipt upload.");
      } else {
        setError(getAuthErrorMessage(err) || "SMS import is currently paused. Please use manual entry or receipt upload.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setRawText("");
    setSender("");
    setResult(null);
    setError(null);
  }

  return (
    <AppPage>
      <AppHeader
        title="Import Bank Alert SMS"
        description="Paste your Nigerian bank debit or credit alert SMS to automatically create ledger entries."
      />

      <AppPageBody>
        <AppPageContent>
          <div className="mx-auto max-w-2xl space-y-4">
            {/* Friendly Paused Banner */}
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Notice:</strong> SMS transaction ingestion is temporarily paused on the backend. Please use manual entry or receipt upload.
                </span>
              </div>
              <Button href="/app/transactions?new=1" variant="primary" className="text-xs py-1.5 px-3 self-start sm:self-auto shrink-0">
                Record Manually
              </Button>
            </div>

            {/* Step 1: Input Form */}
            {!result ? (
              <Card className="p-6 sm:p-8">
                <div className="flex items-center gap-3 border-b border-line pb-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                    <MessageSquareText className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-ink">Step 1 — Paste SMS (Paused)</h2>
                    <p className="text-xs text-mist">
                      Extracts amount, merchant, date, and category automatically.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="sms-raw-text"
                      className="block text-sm font-medium text-ink"
                    >
                      Paste your bank alert SMS here
                    </label>
                    <textarea
                      id="sms-raw-text"
                      rows={5}
                      required
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="e.g. Acct 0123456789 debited N5,000.00 on 15-Sep-2026 at SHOPRITE. Avail Bal: N12,450.00"
                      className="mt-2 w-full rounded-xl border border-line bg-paper/50 p-3.5 text-sm text-ink placeholder:text-mist/70 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sms-sender"
                      className="block text-sm font-medium text-ink"
                    >
                      Sender name <span className="text-xs text-mist font-normal">(optional)</span>
                    </label>
                    <Input
                      id="sms-sender"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      placeholder='e.g. "GTBank", "Access Bank"'
                      className="mt-2"
                    />
                  </div>

                  {/* Supported Banks Pills */}
                  <div>
                    <p className="text-xs font-medium text-mist mb-2">Supported banks:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUPPORTED_BANKS.map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSender(bank)}
                          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            sender.toLowerCase() === bank.toLowerCase()
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                              : "border-line bg-paper text-mist hover:text-ink hover:border-mist"
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-coral-warn/20 bg-coral-warn/5 p-3 text-xs text-coral-warn">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || !rawText.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 shadow-sm"
                    >
                      {loading ? "Parsing alert…" : "Import Transaction"}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              /* Step 2: Confirmation / Result */
              <div className="space-y-4">
                {/* Duplicate Banner */}
                {result.status === "duplicate" && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
                    <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold">Duplicate Alert</h3>
                      <p className="text-xs mt-0.5 text-amber-700">
                        This SMS was already imported. No duplicate transaction was created.
                      </p>
                    </div>
                  </div>
                )}

                {/* Failed Parse Error */}
                {result.status === "failed_parse" ? (
                  <Card className="border-coral-warn/30 bg-coral-warn/5 p-6 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-coral-warn/10 text-coral-warn mb-3">
                      <AlertCircle className="size-6" />
                    </div>
                    <h3 className="text-base font-semibold text-ink">
                      Unable to parse SMS format
                    </h3>
                    <p className="mt-2 text-xs text-mist max-w-md mx-auto">
                      We couldn&apos;t read this SMS format. Try entering the transaction manually.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button href="/app/transactions?new=1" variant="primary">
                        Enter Manually <ArrowRight className="ml-1.5 size-4" />
                      </Button>
                      <Button variant="ghost" onClick={handleReset}>
                        <RotateCcw className="mr-1.5 size-4" /> Try another SMS
                      </Button>
                    </div>
                  </Card>
                ) : (
                  /* Success Confirmation Card */
                  <Card className="overflow-hidden border-emerald-500/30">
                    <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 py-4 px-6">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="size-5 text-emerald-600" />
                        <h2 className="text-sm font-semibold tracking-wide">
                          Imported Transaction
                        </h2>
                      </div>
                    </CardHeader>

                    <CardBody className="p-6 sm:p-8 space-y-4">
                      <div className="divide-y divide-line/60">
                        <div className="flex justify-between py-2.5 text-sm">
                          <span className="text-mist">Type:</span>
                          <span className="font-semibold capitalize text-ink">
                            {result.type || "Expense"}
                          </span>
                        </div>

                        <div className="flex justify-between py-2.5 text-sm">
                          <span className="text-mist">Amount:</span>
                          <span className="font-display font-bold text-lg tabular-nums text-ink">
                            {formatKobo(result.amount_kobo ?? 0)}
                          </span>
                        </div>

                        <div className="flex justify-between py-2.5 text-sm">
                          <span className="text-mist">Merchant:</span>
                          <span className="font-medium text-ink">
                            {result.merchant || "Bank Alert"}
                          </span>
                        </div>

                        <div className="flex justify-between py-2.5 text-sm">
                          <span className="text-mist">Category:</span>
                          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                            {result.category || "Uncategorised"}
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-semibold text-sky">
                              <Sparkles className="size-2.5" /> AI-assigned
                            </span>
                          </span>
                        </div>

                        <div className="flex justify-between py-2.5 text-sm">
                          <span className="text-mist">Date:</span>
                          <span className="font-medium text-ink">
                            {formatDate(result.received_at || new Date())}
                          </span>
                        </div>

                        <div className="flex justify-between py-2.5 text-sm">
                          <span className="text-mist">Source:</span>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            SMS
                          </span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-line flex flex-col sm:flex-row gap-3">
                        {result.transaction_id ? (
                          <Button
                            href={`/app/transactions/${result.transaction_id}`}
                            variant="primary"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            View Transaction
                          </Button>
                        ) : (
                          <Button
                            href="/app/transactions"
                            variant="primary"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            View Transactions
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={handleReset}
                          className="flex-1"
                        >
                          <RotateCcw className="mr-1.5 size-4" /> Import Another
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </div>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
