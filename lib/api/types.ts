export type PlanTier = "free" | "pro" | "advanced";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiErrorBody = {
  success: false;
  error: { code: string; message: string };
  request_id?: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  plan_tier?: PlanTier;
  created_at?: string;
};

export type PlanFeatures = Record<string, boolean>;
export type PlanLimits = Record<string, number | null>;
export type PlanUsage = Record<string, number>;

export type UserPlan = {
  tier: PlanTier;
  features: PlanFeatures;
  limits: PlanLimits;
  usage: PlanUsage;
};

export type BankAccount = {
  id: string;
  bank_name: string;
  account_name: string;
  account_number_masked?: string;
  balance_kobo: number;
  currency?: string;
  is_active?: boolean;
  last_synced_at?: string | null;
};

export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
  id: string;
  amount_kobo: number;
  type: TransactionType;
  category?: string;
  description?: string;
  merchant?: string;
  account_id?: string;
  date: string;
  created_at?: string;
};

export type CursorPage<T> = {
  results: T[];
  next?: string | null;
  previous?: string | null;
};

export type Budget = {
  id: string;
  name: string;
  category: string;
  limit_kobo: number;
  period: "weekly" | "monthly" | "yearly";
  is_active?: boolean;
};

export type BudgetUsage = {
  budget_id: string;
  spent_kobo: number;
  limit_kobo: number;
  percentage: number;
  remaining_kobo: number;
};

export type Report = {
  id: string;
  type: "monthly" | "weekly" | "pl";
  period?: string;
  title?: string;
  created_at: string;
  summary?: Record<string, unknown>;
};

export type Notification = {
  id: string;
  type: "budget_alert" | "bill_reminder" | "weekly_summary" | "cash_flow_warning";
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
  created_at: string;
  updated_at?: string;
};

export type ChatQuota = {
  remaining: number;
  limit: number;
  resets_at?: string;
};

export type ChatResponse = {
  conversation_id: string;
  message: ChatMessage;
  reply: ChatMessage;
};

export type CashFlowPrediction = {
  runway_weeks?: number;
  burn_rate_kobo?: number;
  balance_kobo?: number;
  forecast?: { date: string; balance_kobo: number }[];
};

export type Business = {
  id: string;
  name: string;
  industry?: string;
  is_active?: boolean;
};

export type OAuthProvider = {
  provider: "google" | "github";
  name: string;
};

export type OAuthStart = {
  url: string;
  state: string;
};
