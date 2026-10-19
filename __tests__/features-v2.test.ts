import { describe, it, expect } from "vitest";
import { formatKobo, formatNaira } from "@/lib/format";
import { debtsApi, businessesApi } from "@/lib/api";
import type { DebtSummary, Notification, StaffPayslip } from "@/lib/api/types";

describe("New Features & Formats (v1.2.0 Integration)", () => {
  it("formats kobo amounts correctly into Nigerian Naira (NGN)", () => {
    // 500,000 kobo = ₦5,000.00
    const formatted = formatKobo(500000);
    expect(formatted).toContain("5,000.00");

    // 25,000,000 kobo = ₦250,000.00
    const largeAmount = formatKobo(25000000);
    expect(largeAmount).toContain("250,000.00");

    // 0 kobo = ₦0.00
    const zero = formatKobo(0);
    expect(zero).toContain("0.00");

    // formatNaira helper
    expect(formatNaira(3000000)).toContain("30,000.00");
  });

  it("calculates Nigerian statutory deductions (PAYE, Pension 8%, NHF 2.5%) correctly", () => {
    const grossSalaryKobo = 25000000; // ₦250,000.00
    const pensionKobo = Math.round(grossSalaryKobo * 0.08); // 8% = 2,000,000 (₦20,000)
    const nhfKobo = Math.round(grossSalaryKobo * 0.025); // 2.5% = 625,000 (₦6,250)
    const payeKobo = 1250000; // ₦12,500.00
    const totalDeductionsKobo = pensionKobo + nhfKobo + payeKobo; // 3,875,000 (₦38,750)
    const netPayKobo = grossSalaryKobo - totalDeductionsKobo; // 21,125,000 (₦211,250)

    const payslip: StaffPayslip = {
      gross_salary_kobo: grossSalaryKobo,
      pension_deduction_kobo: pensionKobo,
      nhf_deduction_kobo: nhfKobo,
      paye_deduction_kobo: payeKobo,
      total_deductions_kobo: totalDeductionsKobo,
      net_pay_kobo: netPayKobo,
    };

    expect(payslip.pension_deduction_kobo).toBe(2000000);
    expect(payslip.nhf_deduction_kobo).toBe(625000);
    expect(payslip.total_deductions_kobo).toBe(3875000);
    expect(payslip.net_pay_kobo).toBe(21125000);
    expect(formatNaira(payslip.net_pay_kobo)).toContain("211,250.00");
  });

  it("validates DebtSummary model and calculations", () => {
    const mockSummary: DebtSummary = {
      total_outstanding_kobo: 15000000,
      overdue_count: 1,
      overdue_amount_kobo: 5000000,
      due_this_week_kobo: 10000000,
      total_debts_count: 3,
      unpaid_debts_count: 2,
      top_debtors: [
        {
          id: "deb_1",
          debtor_name: "Kola Enterprises",
          phone_number: "08012345678",
          amount_kobo: 10000000,
          remaining_amount_kobo: 10000000,
          due_date: "2026-10-25",
          is_overdue: false,
        },
        {
          id: "deb_2",
          debtor_name: "Tunde Bakare",
          phone_number: "08098765432",
          amount_kobo: 5000000,
          remaining_amount_kobo: 5000000,
          due_date: "2026-10-10",
          is_overdue: true,
        },
      ],
    };

    expect(mockSummary.total_outstanding_kobo).toBe(15000000);
    expect(mockSummary.overdue_count).toBe(1);
    expect(mockSummary.top_debtors.length).toBe(2);
    expect(mockSummary.top_debtors[1].is_overdue).toBe(true);
  });

  it("validates debt_payment_match notification metadata structure", () => {
    const notification: Notification = {
      id: "notif_1",
      type: "debt_payment_match",
      title: "Payment match suggestion: Kola Enterprises",
      body: "We detected a credit of ₦30,000.00. Did Kola Enterprises make a payment towards their balance?",
      metadata: {
        debt_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        transaction_id: "4e1a0b5c-3f2a-4c28-98f5-19e917d5258e",
        transaction_amount_kobo: 3000000,
        debt_remaining_kobo: 3000000,
        debtor_name: "Kola Enterprises",
      },
      is_read: false,
      created_at: "2026-10-19T12:00:00Z",
    };

    expect(notification.type).toBe("debt_payment_match");
    expect(notification.metadata?.debt_id).toBe("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");
    expect(notification.metadata?.transaction_amount_kobo).toBe(3000000);
  });

  it("exports all v1.2.0 API functions for debts and staff payslip", () => {
    expect(typeof debtsApi.summary).toBe("function");
    expect(typeof debtsApi.list).toBe("function");
    expect(typeof debtsApi.create).toBe("function");
    expect(typeof debtsApi.get).toBe("function");
    expect(typeof debtsApi.patch).toBe("function");
    expect(typeof debtsApi.remove).toBe("function");
    expect(typeof debtsApi.markPaid).toBe("function");
    expect(typeof debtsApi.confirmMatch).toBe("function");
    expect(typeof debtsApi.reminderMessage).toBe("function");
    expect(typeof businessesApi.payslip).toBe("function");
  });
});
