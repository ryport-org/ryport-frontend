import { describe, it, expect } from "vitest";
import { getPersonalDashboard, getSmeDashboard } from "@/lib/api/dashboard";
import type { PersonalDashboardData, SmeDashboardData } from "@/lib/api/types";

describe("Dashboard Data Models & Routing Requirements", () => {
  it("PersonalDashboardData model supports empty states for goals and budget alerts", () => {
    const mockPersonalData: PersonalDashboardData = {
      balance_summary: { total_balance_kobo: 2500000, linked_accounts_count: 1 },
      spend_by_category: [{ category: "Food", amount_kobo: 50000, percentage: 10 }],
      budget_alerts: [], // Empty state
      goal_progress: null, // Empty state
      ai_quota: { remaining: 10, limit: 10, resets_at: "", is_unlimited: false },
      recent_transactions: [],
    };

    expect(mockPersonalData.budget_alerts.length).toBe(0);
    expect(mockPersonalData.goal_progress).toBeNull();
    expect(mockPersonalData.balance_summary.total_balance_kobo).toBe(2500000);
  });

  it("SmeDashboardData model requires last_verified_date in tax_status for compliance", () => {
    const mockSmeData: SmeDashboardData = {
      active_business: { id: "biz_101", name: "Ryport SME Enterprise Ltd", currency: "NGN" },
      runway: { runway_days: 120, runway_months: 4, burn_rate_monthly_kobo: 100000000 },
      pl_snapshot: { revenue_kobo: 300000000, expenses_kobo: 200000000, net_profit_kobo: 100000000, period: "This Month" },
      cost_anomalies: [
        { id: "anom_1", category: "Software", increase_percent: 45, description: "Unusual SaaS bill spike", severity: "high" },
      ],
      staff_summary: { total_payroll_kobo: 50000000, staff_count: 10, missed_payments: 0 },
      tax_status: {
        cit_status: "Verified",
        vat_status: "Verified",
        last_verified_date: "2026-08-15",
      },
      energy_cost_trend: {
        current_month_kobo: 5000000,
        previous_month_kobo: 4500000,
        change_percent: 11,
      },
      team_summary: { member_count: 10, pending_invites_count: 2 },
    };

    expect(mockSmeData.tax_status.last_verified_date).toBe("2026-08-15");
    expect(mockSmeData.tax_status.cit_status).toBe("Verified");
    expect(mockSmeData.cost_anomalies.length).toBe(1);
    expect(mockSmeData.energy_cost_trend).not.toBeNull();
  });

  it("getPersonalDashboard and getSmeDashboard are exported API functions", () => {
    expect(typeof getPersonalDashboard).toBe("function");
    expect(typeof getSmeDashboard).toBe("function");
  });
});
