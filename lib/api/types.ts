export type Plan = "free" | "pro" | "advanced";

export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Utilities"
  | "Healthcare"
  | "Entertainment"
  | "Business"
  | "Education"
  | "Uncategorised";

export type ApiSuccess<T> = { success: true; data: T };

export type ApiErrorBody = {
  success: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
  request_id?: string;
};

export type AuthTokens = { access: string; refresh: string };

export type Profile = {
  id: string;
  email: string;
  plan: Plan;
  role?: "user" | "admin" | string;
  is_staff?: boolean;
  is_2fa_enabled: boolean;
  last_login_ip: string | null;
  created_at: string;
};

export type PlanFeature = {
  name: string;
  enabled: boolean;
  limit: number | null;
};

export type PlanResponse = {
  plan: Plan;
  display_name: string;
  features: PlanFeature[];
};

export type AuthResponse = AuthTokens & {
  id: string;
  email: string;
  plan: Plan;
  is_2fa_enabled?: boolean;
};

export type BankAccount = {
  id: string;
  bank_name: string;
  account_name: string;
  masked_account_number: string;
  mono_account_id?: string;
  is_active: boolean;
  connected_at: string;
  balance_kobo?: number;
};

export type Transaction = {
  id: string;
  account_id: string | null;
  amount_kobo: number;
  type: TransactionType;
  category: TransactionCategory | string;
  description: string;
  merchant: string;
  is_manual?: boolean;
  transaction_date: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type CursorPage<T> = {
  next: string | null;
  previous: string | null;
  page_size: number;
  results: T[];
};

export type Budget = {
  id: string;
  name?: string;
  category: string;
  limit_kobo: number;
  period: "weekly" | "monthly";
  is_active?: boolean;
  is_ai_recommended?: boolean;
};

export type BudgetUsage = {
  budget_id: string;
  category: string;
  period: string;
  limit_kobo: number;
  spent_kobo: number;
  remaining_kobo: number;
  usage_percent: number;
  period_start: string;
  period_end: string;
  is_over_budget: boolean;
  is_warning: boolean;
};

export type Report = {
  id: string;
  type: "monthly" | "weekly" | "pl";
  period?: string;
  title?: string;
  created_at: string;
  data?: Record<string, unknown>;
  summary?: Record<string, unknown>;
};

export type NotificationType =
  | "budget_alert"
  | "bill_reminder"
  | "weekly_summary"
  | "cash_flow_warning";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  title?: string;
  messages?: ChatMessage[];
  message_count?: number;
  created_at: string;
  updated_at?: string;
};

export type ChatResponse = {
  response: string;
  reply: string;
  conversation_id: string;
  message_id: string;
  remaining_quota: number | null;
};

export type AIQuota = {
  used: number;
  limit: number;
  remaining: number;
  resets_at: string;
  is_unlimited: boolean;
};

export type CashFlowProjection = {
  date: string;
  projected_balance: number;
  balance_naira?: string;
};

export type CashFlowPrediction = {
  current_balance?: number;
  current_balance_naira?: string;
  projections?: CashFlowProjection[];
  days_until_low?: number | null;
  low_balance_date?: string | null;
  expected_income_date?: string | null;
  ai_insight?: string;
  burn_rate_daily?: number;
  burn_rate_monthly?: number;
  burn_rate_kobo_per_month?: number;
};

export type SubscriptionItem = {
  merchant: string;
  amount_monthly_kobo: number;
  amount_monthly_naira?: string;
  amount_annual_naira?: string;
  frequency: "monthly" | "weekly" | string;
  last_charged?: string;
  times_charged?: number;
  category?: string;
  is_duplicate?: boolean;
};

export type AiCategoriseResult = {
  category: string;
  was_cached: boolean;
};

export type AppliedBudgetRecommendation = {
  id: string;
  category: string;
  limit_kobo: number;
  period: "weekly" | "monthly";
  is_ai_recommended: boolean;
};

export type BudgetRecommendation = {
  category: string;
  db_category: string;
  avg_spend: number;
  recommended_limit: number;
  reasoning: string;
  confidence: number;
};

export type CfoAnalysis = {
  generated_at?: string;
  business?: string;
  period_days?: number;
  health_score?: number;
  executive_summary?: string;
  summary?: string;
  runway?: {
    months?: number;
    weeks?: number;
    zero_date?: string;
    risk_level?: string;
    current_balance?: number;
  };
  runway_months?: number;
  runway_notes?: string;
  burn_rate?: {
    monthly?: number;
    weekly?: number;
    daily?: number;
    trend?: string;
    trend_percentage?: number;
  };
  burn_rate_kobo_per_month?: number;
  revenue_analysis?: { mom_growth_percent?: number; trend?: string };
  risks?: { severity: string; description: string }[];
  risk_flags?: { severity: string; description: string }[];
  cost_savings?: Record<string, unknown>[];
  savings_recommendations?: Record<string, unknown>[];
  wasteful_expenses?: Record<string, unknown>[];
  hiring_recommendation?: Record<string, unknown>;
  pricing_recommendation?: Record<string, unknown>;
  cached?: boolean;
};

export type Business = {
  id: string;
  name: string;
  type?: string;
  currency?: string;
  industry?: string;
  is_active?: boolean;
};

export type TeamMember = {
  id: string;
  email: string;
  role: string;
  name?: string;
};

export type TeamInvite = {
  id: string;
  email: string;
  role: string;
  expires_at?: string;
};

export type OAuthProvider = {
  provider: "google" | "github" | string;
  name?: string;
  scopes?: string;
};

export type OAuthStart = { provider: string; url: string; state: string };

export type TwoFactorSetup = {
  qr_code_url: string;
  provisioning_uri: string;
  secret: string;
};
