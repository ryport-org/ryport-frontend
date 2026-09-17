"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  HandCoins,
  Plus,
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
import type { Debt, DebtStatus, DebtType } from "@/lib/api/types";
import { formatDate, formatKobo } from "@/lib/format";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DebtType>("owed_to_me");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<DebtType>("owed_to_me");
  const [counterparty, setCounterparty] = useState("");
  const [amountNaira, setAmountNaira] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<DebtStatus>("pending");

  async function loadDebts() {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await debtsApi.list(token);
      setDebts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDebts();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !counterparty.trim() || !amountNaira) return;

    const amountKobo = Math.round(parseFloat(amountNaira) * 100);
    if (isNaN(amountKobo) || amountKobo <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await debtsApi.create(token, {
        counterparty: counterparty.trim(),
        amount_kobo: amountKobo,
        type: formType,
        description: description.trim(),
        due_date: dueDate || null,
        status,
      });

      setShowModal(false);
      // Reset form
      setCounterparty("");
      setAmountNaira("");
      setDescription("");
      setDueDate("");
      setStatus("pending");
      await loadDebts();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(debtId: string, newStatus: DebtStatus) {
    const token = getAccessToken();
    if (!token) return;
    setUpdatingId(debtId);

    // Optimistic UI update
    setDebts((prev) =>
      prev.map((d) => (d.id === debtId ? { ...d, status: newStatus } : d)),
    );

    try {
      await debtsApi.patch(token, debtId, { status: newStatus });
    } catch (err) {
      // Revert on error
      await loadDebts();
      setError(getAuthErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(debtId: string) {
    const token = getAccessToken();
    if (!token || !confirm("Delete this debt record?")) return;

    setDebts((prev) => prev.filter((d) => d.id !== debtId));

    try {
      await debtsApi.remove(token, debtId);
    } catch (err) {
      await loadDebts();
      setError(getAuthErrorMessage(err));
    }
  }

  // Filter debts by tab
  const filteredDebts = useMemo(
    () => debts.filter((d) => d.type === activeTab),
    [debts, activeTab],
  );

  // Summary stats
  const totalAmountKobo = useMemo(
    () => filteredDebts.reduce((sum, d) => sum + (d.amount_kobo || 0), 0),
    [filteredDebts],
  );

  const outstandingCount = useMemo(
    () => filteredDebts.filter((d) => d.status === "pending").length,
    [filteredDebts],
  );

  return (
    <AppPage>
      <AppHeader
        title="Debts & Receivables"
        description="Track money owed to you and money you owe to others."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setFormType(activeTab);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="size-4" /> Record Debt
          </Button>
        }
      />

      <AppPageBody>
        <AppPageContent>
          {error && (
            <div className="mb-4 rounded-xl border border-coral-warn/20 bg-coral-warn/5 p-4 text-xs text-coral-warn">
              {error}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-line mb-6 gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("owed_to_me")}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "owed_to_me"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-mist hover:text-ink"
              }`}
            >
              <ArrowDownLeft className="size-4 text-emerald-600" />
              Owed to me
              <span className="ml-1 rounded-full bg-paper px-2 py-0.5 text-xs text-mist font-normal">
                {debts.filter((d) => d.type === "owed_to_me").length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("i_owe")}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "i_owe"
                  ? "border-brand text-brand"
                  : "border-transparent text-mist hover:text-ink"
              }`}
            >
              <ArrowUpRight className="size-4 text-brand" />
              I owe
              <span className="ml-1 rounded-full bg-paper px-2 py-0.5 text-xs text-mist font-normal">
                {debts.filter((d) => d.type === "i_owe").length}
              </span>
            </button>
          </div>

          {/* Summary Row */}
          <Card className="mb-6 p-4 sm:p-5 bg-paper/40 border-line">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-mist">
                  {activeTab === "owed_to_me" ? "Total owed to me:" : "Total I owe:"}
                </span>
                <span className="font-display font-bold text-lg tabular-nums text-ink">
                  {formatKobo(totalAmountKobo)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-mist">
                <span className="hidden sm:inline">|</span>
                <span>
                  Outstanding:{" "}
                  <strong className="text-ink font-semibold">{outstandingCount}</strong> items
                </span>
              </div>
            </div>
          </Card>

          {/* Cards List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : filteredDebts.length === 0 ? (
            <Card className="p-12 text-center">
              <HandCoins className="size-10 text-mist mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-ink">
                {activeTab === "owed_to_me"
                  ? "No receivables recorded"
                  : "No payables recorded"}
              </h3>
              <p className="mt-1 text-xs text-mist max-w-sm mx-auto">
                {activeTab === "owed_to_me"
                  ? "Keep track of invoices, loans, or money clients and friends owe you."
                  : "Keep track of bills, borrowed funds, or money you owe to suppliers."}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setFormType(activeTab);
                  setShowModal(true);
                }}
                className="mt-4"
              >
                <Plus className="mr-1.5 size-3.5" /> Record first debt
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDebts.map((debt) => {
                const isSettled = debt.status === "settled";
                return (
                  <Card
                    key={debt.id}
                    className={`transition-all ${
                      isSettled ? "opacity-75 bg-paper/40" : "bg-white hover:border-mist"
                    }`}
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Counterparty & Description */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-ink truncate">
                              {debt.counterparty}
                            </h3>
                            {isSettled ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                                <Check className="size-3" /> Settled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                                <Clock className="size-3" /> Pending
                              </span>
                            )}
                          </div>
                          {debt.description && (
                            <p className="mt-1 text-xs text-mist line-clamp-2">
                              {debt.description}
                            </p>
                          )}
                          {debt.due_date && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-mist">
                              <Calendar className="size-3.5" />
                              Due: {formatDate(debt.due_date)}
                            </p>
                          )}
                        </div>

                        {/* Right: Amount & Status Dropdown */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                          <p className="font-display text-lg font-bold tabular-nums text-ink">
                            {formatKobo(debt.amount_kobo)}
                          </p>

                          <div className="flex items-center gap-2">
                            <select
                              value={debt.status}
                              disabled={updatingId === debt.id}
                              onChange={(e) =>
                                handleStatusChange(debt.id, e.target.value as DebtStatus)
                              }
                              className={`${inputClassName} py-1 px-2.5 text-xs font-medium rounded-lg h-8 cursor-pointer ${
                                isSettled
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                  : "text-amber-800 bg-amber-50 border-amber-200"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="settled">Settled</option>
                            </select>

                            <button
                              type="button"
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

          {/* Record Debt Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-line">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <h2 className="text-base font-semibold text-ink">Record Debt</h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg p-1 text-mist hover:bg-paper hover:text-ink"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="mt-5 space-y-4">
                  {/* Type Selector */}
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormType("owed_to_me")}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          formType === "owed_to_me"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                            : "border-line bg-paper text-mist hover:text-ink"
                        }`}
                      >
                        <ArrowDownLeft className="size-3.5" /> Owed to me (Receivable)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType("i_owe")}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          formType === "i_owe"
                            ? "border-brand bg-brand/10 text-brand font-semibold"
                            : "border-line bg-paper text-mist hover:text-ink"
                        }`}
                      >
                        <ArrowUpRight className="size-3.5" /> I owe (Payable)
                      </button>
                    </div>
                  </div>

                  {/* Counterparty */}
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">
                      Counterparty (Person or Business)
                    </label>
                    <Input
                      required
                      value={counterparty}
                      onChange={(e) => setCounterparty(e.target.value)}
                      placeholder='e.g. "Tunde Bakare" or "Acme Corp"'
                    />
                  </div>

                  {/* Amount (Naira) */}
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">
                      Amount (₦)
                    </label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountNaira}
                      onChange={(e) => setAmountNaira(e.target.value)}
                      placeholder="25000.00"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">
                      Description <span className="text-mist font-normal">(optional)</span>
                    </label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder='e.g. "Freelance design invoice #004"'
                    />
                  </div>

                  {/* Due Date & Initial Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">
                        Due Date <span className="text-mist font-normal">(optional)</span>
                      </label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as DebtStatus)}
                        className={`${inputClassName}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="settled">Settled</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-line flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving || !counterparty.trim() || !amountNaira}
                    >
                      {saving ? "Saving…" : "Record Debt"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
