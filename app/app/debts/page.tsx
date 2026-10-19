"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  HandCoins,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { debtsApi } from "@/lib/api";
import type {
  Debt,
  DebtStatus,
  DebtSummary,
  ReminderMessageResponse,
} from "@/lib/api/types";
import { formatDate, formatNaira } from "@/lib/format";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "outstanding" | "overdue" | "paid";

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingDebt, setSavingDebt] = useState(false);

  // Add Debt Form State
  const [debtorName, setDebtorName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amountNaira, setAmountNaira] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Record Payment Dialog State
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [payFull, setPayFull] = useState(true);
  const [partialNaira, setPartialNaira] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Send Reminder Dialog State
  const [reminderDebt, setReminderDebt] = useState<Debt | null>(null);
  const [reminderData, setReminderData] = useState<ReminderMessageResponse | null>(null);
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Action pending states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  async function loadData() {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [debtsRes, summaryRes] = await Promise.all([
        debtsApi.list(token).catch(() => [] as Debt[]),
        debtsApi.summary(token).catch(() => null),
      ]);
      setDebts(Array.isArray(debtsRes) ? debtsRes : []);
      setSummary(summaryRes);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !debtorName.trim() || !amountNaira || !dueDate) return;

    const amountKobo = Math.round(parseFloat(amountNaira) * 100);
    if (isNaN(amountKobo) || amountKobo <= 0) {
      setError("Please enter a valid amount in Naira.");
      return;
    }

    setSavingDebt(true);
    setError(null);

    try {
      await debtsApi.create(token, {
        debtor_name: debtorName.trim(),
        phone_number: phoneNumber.trim() || undefined,
        amount_kobo: amountKobo,
        due_date: dueDate,
        notes: notes.trim() || undefined,
      });

      setShowAddModal(false);
      setDebtorName("");
      setPhoneNumber("");
      setAmountNaira("");
      setDueDate("");
      setNotes("");
      showToast("Receivable recorded successfully.");
      await loadData();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingDebt(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentDebt) return;
    const token = getAccessToken();
    if (!token) return;

    setRecordingPayment(true);
    setError(null);

    try {
      let amountKobo: number | undefined = undefined;
      if (!payFull && partialNaira) {
        amountKobo = Math.round(parseFloat(partialNaira) * 100);
      }

      await debtsApi.markPaid(token, paymentDebt.id, {
        amount_kobo: amountKobo,
      });

      setPaymentDebt(null);
      setPartialNaira("");
      setPayFull(true);
      showToast("Payment recorded successfully.");
      await loadData();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRecordingPayment(false);
    }
  }

  async function openReminderModal(debt: Debt) {
    const token = getAccessToken();
    if (!token) return;
    setReminderDebt(debt);
    setLoadingReminder(true);
    setCopiedText(false);
    try {
      const data = await debtsApi.reminderMessage(token, debt.id);
      setReminderData(data);
    } catch {
      // Fallback preformatted reminder
      const name = debt.debtor_name || debt.counterparty || "Valued Customer";
      const remaining = debt.remaining_amount_kobo ?? debt.amount_kobo;
      const amountText = formatNaira(remaining);
      const phone = debt.phone_number?.replace(/\D/g, "") || "";
      const text = `Hello ${name}, this is a gentle reminder that you have an outstanding balance of ${amountText} due on ${debt.due_date}. Please let us know when payment is made. Thank you!`;
      const encoded = encodeURIComponent(text);
      setReminderData({
        debt_id: debt.id,
        debtor_name: name,
        phone_number: debt.phone_number || "",
        remaining_amount_kobo: remaining,
        sms_text: text,
        whatsapp_url: phone ? `https://wa.me/${phone}?text=${encoded}` : "",
      });
    } finally {
      setLoadingReminder(false);
    }
  }

  function handleSendWhatsApp() {
    if (!reminderData?.whatsapp_url) {
      alert("Missing valid phone number for this debtor.");
      return;
    }
    window.open(reminderData.whatsapp_url, "_blank");
  }

  function handleCopySms() {
    if (!reminderData?.sms_text) return;
    navigator.clipboard.writeText(reminderData.sms_text);
    setCopiedText(true);
    showToast("Reminder SMS copied to clipboard.");
    setTimeout(() => setCopiedText(false), 3000);
  }

  async function handleDelete(debtId: string) {
    const token = getAccessToken();
    if (!token || !confirm("Delete this debt record?")) return;

    setDeletingId(debtId);
    try {
      await debtsApi.remove(token, debtId);
      setDebts((prev) => prev.filter((d) => d.id !== debtId));
      showToast("Debt record removed.");
      await loadData();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  // Filtered debts
  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      const isOverdue = Boolean(d.is_overdue || d.status === "overdue");
      const isPaid = d.status === "paid" || (d.remaining_amount_kobo === 0 && d.amount_paid_kobo! > 0);
      const isOutstanding = d.status === "outstanding" || d.status === "partially_paid" || (!isPaid && !isOverdue);

      if (filterTab === "all") return true;
      if (filterTab === "overdue") return isOverdue;
      if (filterTab === "outstanding") return isOutstanding;
      if (filterTab === "paid") return isPaid;
      return true;
    });
  }, [debts, filterTab]);

  const totalOutstanding = summary?.total_outstanding_kobo ??
    debts.reduce((sum, d) => sum + (d.remaining_amount_kobo ?? d.amount_kobo ?? 0), 0);

  const overdueCount = summary?.overdue_count ??
    debts.filter((d) => d.is_overdue || d.status === "overdue").length;

  const dueThisWeek = summary?.due_this_week_kobo ?? 0;

  return (
    <AppPage>
      <AppHeader
        title="Debts & Receivables"
        description='Track "Who Owes Me", payment due dates, partial payments, and overdue statuses.'
        action={
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="size-4" /> Add Receivable
          </Button>
        }
      />

      <AppPageBody>
        <AppPageContent>
          {error && (
            <div className="mb-4 rounded-xl border border-coral-warn/20 bg-coral-warn/5 p-4 text-xs text-coral-warn flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-mist hover:text-ink">
                <X className="size-4" />
              </button>
            </div>
          )}

          {successToast && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Top Summary Metrics */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="border-amber-300 bg-amber-50/80 p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                MONEY WAITING TO BE COLLECTED
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-amber-950 tabular-nums">
                {formatNaira(totalOutstanding)}
              </p>
              <p className="mt-1 text-xs text-amber-800 font-medium">
                {summary?.unpaid_debts_count ?? debts.filter(d => d.status !== "paid").length} open debtor(s)
              </p>
            </Card>

            <Card className="p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-mist">
                OVERDUE RECEIVABLES
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums">
                {overdueCount}
              </p>
              <p className="mt-1 text-xs text-mist">
                {summary?.overdue_amount_kobo
                  ? `${formatNaira(summary.overdue_amount_kobo)} past due`
                  : "Immediate attention required"}
              </p>
            </Card>

            <Card className="p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-mist">
                DUE THIS WEEK
              </span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink tabular-nums">
                {formatNaira(dueThisWeek)}
              </p>
              <p className="mt-1 text-xs text-mist">Expected cash inflow in the next 7 days</p>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-line mb-6 gap-2 sm:gap-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                filterTab === "all"
                  ? "border-sky text-sky"
                  : "border-transparent text-mist hover:text-ink"
              }`}
            >
              All Receivables
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-mist font-normal">
                {debts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("outstanding")}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                filterTab === "outstanding"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-mist hover:text-ink"
              }`}
            >
              <Clock className="size-4 text-amber-600" />
              Outstanding
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-mist font-normal">
                {debts.filter(d => d.status === "outstanding" || d.status === "partially_paid").length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("overdue")}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                filterTab === "overdue"
                  ? "border-rose-600 text-rose-700"
                  : "border-transparent text-mist hover:text-ink"
              }`}
            >
              <AlertCircle className="size-4 text-rose-600" />
              Overdue
              <span className="rounded-full bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 text-xs">
                {overdueCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("paid")}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                filterTab === "paid"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-mist hover:text-ink"
              }`}
            >
              <Check className="size-4 text-emerald-600" />
              Paid / Settled
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-mist font-normal">
                {debts.filter(d => d.status === "paid").length}
              </span>
            </button>
          </div>

          {/* Debts List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : filteredDebts.length === 0 ? (
            <Card className="p-12 text-center">
              <HandCoins className="size-10 text-mist mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-ink">No receivables found</h3>
              <p className="mt-1 text-xs text-mist max-w-sm mx-auto">
                {filterTab === "overdue"
                  ? "Great news! You have no overdue debts right now."
                  : filterTab === "paid"
                  ? "No paid debts recorded in this view."
                  : "Keep track of clients, invoices, loans, or customers who owe you money."}
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                className="mt-4"
              >
                <Plus className="mr-1.5 size-3.5" /> Record first debt
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDebts.map((debt) => {
                const name = debt.debtor_name || debt.counterparty || "Debtor";
                const isOverdue = Boolean(debt.is_overdue || debt.status === "overdue");
                const isPaid = debt.status === "paid";
                const remaining = debt.remaining_amount_kobo ?? debt.amount_kobo;
                const isInvoice = debt.source === "auto_from_invoice";

                return (
                  <Card
                    key={debt.id}
                    className={cn(
                      "transition-all",
                      isPaid
                        ? "bg-paper/40 opacity-80"
                        : isOverdue
                        ? "border-rose-200 bg-rose-50/20 hover:border-rose-300"
                        : "bg-white hover:border-mist",
                    )}
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Debtor Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-ink truncate">
                              {name}
                            </h3>

                            {isInvoice && (
                              <span className="rounded-md bg-paper border border-line px-1.5 py-0.5 text-[10px] font-medium text-mist">
                                Invoice Sync
                              </span>
                            )}

                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                                <AlertCircle className="size-3" /> Overdue
                              </span>
                            ) : isPaid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                                <Check className="size-3" /> Paid
                              </span>
                            ) : debt.status === "partially_paid" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                                <Clock className="size-3" /> Partially Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                                <Clock className="size-3" /> Outstanding
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist">
                            {debt.phone_number && (
                              <span className="flex items-center gap-1 text-ink/80 font-medium">
                                <Phone className="size-3 text-mist" /> {debt.phone_number}
                              </span>
                            )}
                            {debt.due_date && (
                              <span
                                className={cn(
                                  "flex items-center gap-1 font-medium",
                                  isOverdue ? "text-rose-600 font-semibold" : "text-mist",
                                )}
                              >
                                <Calendar className="size-3" />
                                Due: {formatDate(debt.due_date)}
                              </span>
                            )}
                            {debt.amount_paid_kobo ? (
                              <span className="text-emerald-700 font-medium">
                                Paid: {formatNaira(debt.amount_paid_kobo)}
                              </span>
                            ) : null}
                          </div>

                          {debt.notes && (
                            <p className="mt-2 text-xs text-mist/90 line-clamp-2">
                              {debt.notes}
                            </p>
                          )}
                        </div>

                        {/* Right: Amounts & Actions */}
                        <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                          <div className="text-left sm:text-right">
                            <span className="text-[11px] uppercase tracking-wider text-mist">
                              {isPaid ? "Total Paid" : "Remaining Balance"}
                            </span>
                            <p
                              className={cn(
                                "font-display text-xl font-bold tabular-nums",
                                isOverdue ? "text-rose-600" : "text-ink",
                              )}
                            >
                              {formatNaira(remaining)}
                            </p>
                            {!isPaid && debt.amount_paid_kobo ? (
                              <span className="text-[11px] text-mist">
                                of {formatNaira(debt.amount_kobo)} total
                              </span>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {!isPaid && (
                              <>
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setPaymentDebt(debt);
                                    setPayFull(true);
                                    setPartialNaira("");
                                  }}
                                  className="text-xs py-1 px-2.5 h-8 font-medium flex items-center gap-1"
                                >
                                  <DollarSign className="size-3.5 text-emerald-600" /> Record Payment
                                </Button>

                                <Button
                                  variant="secondary"
                                  onClick={() => openReminderModal(debt)}
                                  className="text-xs py-1 px-2.5 h-8 font-medium flex items-center gap-1"
                                >
                                  <Send className="size-3 text-sky" /> Send Reminder
                                </Button>
                              </>
                            )}

                            <button
                              type="button"
                              disabled={deletingId === debt.id}
                              onClick={() => handleDelete(debt.id)}
                              className="text-mist hover:text-coral-warn p-1.5 rounded-lg hover:bg-paper transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Add Receivable Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-line animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2">
                    <HandCoins className="size-5 text-amber-600" />
                    <h2 className="text-base font-semibold text-ink">Add Receivable ("Who Owes Me")</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg p-1 text-mist hover:bg-paper hover:text-ink"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">
                      Debtor Name (Person or Business) *
                    </label>
                    <Input
                      required
                      value={debtorName}
                      onChange={(e) => setDebtorName(e.target.value)}
                      placeholder='e.g. "Kola Enterprises" or "Tunde Bakare"'
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">
                      Phone Number <span className="text-mist font-normal">(for WhatsApp & SMS reminders)</span>
                    </label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder='e.g. "08012345678" or "+2348012345678"'
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">
                        Amount (₦) *
                      </label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountNaira}
                        onChange={(e) => setAmountNaira(e.target.value)}
                        placeholder="50000.00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">
                        Due Date *
                      </label>
                      <Input
                        required
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">
                      Notes / Description <span className="text-mist font-normal">(optional)</span>
                    </label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder='e.g. "Invoice #204 - Delivery of office supplies"'
                    />
                  </div>

                  <div className="pt-4 border-t border-line flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={savingDebt || !debtorName.trim() || !amountNaira || !dueDate}
                    >
                      {savingDebt ? "Saving…" : "Save Receivable"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Record Payment Dialog */}
          {paymentDebt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-line animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Record Payment</h2>
                    <p className="text-xs text-mist mt-0.5">
                      Debtor: {paymentDebt.debtor_name || paymentDebt.counterparty}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentDebt(null)}
                    className="rounded-lg p-1 text-mist hover:bg-paper hover:text-ink"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleRecordPayment} className="mt-5 space-y-4">
                  <div className="rounded-xl bg-paper p-3 border border-line text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-mist">Total Debt Amount:</span>
                      <span className="font-semibold text-ink">{formatNaira(paymentDebt.amount_kobo)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-mist">Remaining Balance:</span>
                      <span className="font-bold text-ink">
                        {formatNaira(paymentDebt.remaining_amount_kobo ?? paymentDebt.amount_kobo)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payFull}
                        onChange={(e) => setPayFull(e.target.checked)}
                        className="rounded border-line text-sky focus:ring-sky size-4"
                      />
                      <span className="text-xs font-medium text-ink">
                        Mark full remaining balance as paid ({formatNaira(paymentDebt.remaining_amount_kobo ?? paymentDebt.amount_kobo)})
                      </span>
                    </label>

                    {!payFull && (
                      <div className="pt-2">
                        <label className="block text-xs font-medium text-ink mb-1">
                          Partial Payment Amount (₦)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={partialNaira}
                          onChange={(e) => setPartialNaira(e.target.value)}
                          placeholder="e.g. 20000.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-line flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setPaymentDebt(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={recordingPayment || (!payFull && !partialNaira)}
                    >
                      {recordingPayment ? "Recording…" : "Confirm Payment"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Send Reminder Dialog */}
          {reminderDebt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-line animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="size-5 text-emerald-600" />
                    <h2 className="text-base font-semibold text-ink">Send Payment Reminder</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderDebt(null);
                      setReminderData(null);
                    }}
                    className="rounded-lg p-1 text-mist hover:bg-paper hover:text-ink"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {loadingReminder ? (
                  <div className="py-8 space-y-3">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl bg-paper/60 p-3.5 border border-line text-xs">
                      <p className="font-semibold text-ink">
                        Debtor: {reminderData?.debtor_name || reminderDebt.debtor_name || reminderDebt.counterparty}
                      </p>
                      <p className="text-mist mt-0.5">
                        Phone: {reminderData?.phone_number || reminderDebt.phone_number || "Not provided"}
                      </p>
                      <p className="text-ink font-semibold mt-1">
                        Outstanding: {formatNaira(reminderData?.remaining_amount_kobo ?? reminderDebt.remaining_amount_kobo ?? reminderDebt.amount_kobo)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
                        Pre-formatted Message Preview:
                      </label>
                      <div className="rounded-xl border border-line bg-white p-3 text-xs text-ink/90 font-mono leading-relaxed whitespace-pre-wrap">
                        {reminderData?.sms_text}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-line">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleSendWhatsApp}
                        className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 text-xs py-2"
                      >
                        <MessageCircle className="size-4" /> Send via WhatsApp
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCopySms}
                        className="w-full sm:flex-1 flex items-center justify-center gap-1.5 text-xs py-2"
                      >
                        {copiedText ? (
                          <>
                            <Check className="size-4 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" /> Copy Reminder SMS
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
