export type StaffRole = "superadmin" | "support" | "finance" | "engineering";

export type StaffPermissionKey = keyof StaffPermissions;

export interface StaffPermissions {
  can_manage_staff: boolean;
  can_view_revenue: boolean;
  can_suspend_users: boolean;
  can_view_system: boolean;
  can_send_announcements: boolean;
  can_view_audit_log: boolean;
  can_export_users: boolean;
  can_change_plans: boolean;
  can_view_analytics: boolean;
  can_view_dashboard: boolean;
}

export interface StaffUser {
  id: string;
  email: string;
  role: StaffRole;
  department: string;
  is_active: boolean;
  permissions: StaffPermissions;
  last_login_at: string | null;
  created_at: string;
}

export interface StaffAuthResponse {
  access: string;
  refresh: string;
  staff_user: StaffUser;
}

export interface StaffRefreshResponse {
  access: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  request_id?: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  request_id?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export interface Paginated<T> {
  results: T[];
  total_count: number;
  page: number;
  total_pages: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface DashboardKpis {
  total_users: number;
  active_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  mrr_kobo?: number;
  mrr_naira?: string;
  arr_naira?: string;
  total_transactions: number;
  ai_messages_today: number;
  active_bank_connections: number;
}

export interface ServiceStatusEntry {
  status: string;
  response_ms?: number;
  memory_used?: string;
  active_workers?: number;
}

export interface SystemAlert {
  id: string;
  title: string;
  message?: string;
  severity: string;
  created_at: string;
  resolved?: boolean;
}

export interface RecentActivity {
  event: string;
  email_masked: string;
  plan?: string;
  timestamp: string;
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  plan_distribution: Record<string, number>;
  service_status: Record<string, ServiceStatusEntry>;
  system_alerts: SystemAlert[];
  recent_activity: RecentActivity[];
}

export interface CustomerUserListItem {
  id: string;
  email_masked: string;
  first_name?: string;
  plan: string;
  plan_badge?: string;
  is_suspended: boolean;
  is_2fa_enabled?: boolean;
  bank_accounts_count?: number;
  transactions_count?: number;
  signed_up_at: string;
  last_active_at?: string | null;
}

export interface UserStats {
  total_transactions: number;
  total_bank_accounts: number;
  total_budgets: number;
  total_ai_messages_lifetime: number;
}

export interface PlanHistoryEntry {
  plan: string;
  started_at: string;
  ended_at?: string | null;
}

export interface ActivityTimelineEntry {
  event: string;
  timestamp: string;
}

export interface UserFlags {
  anomaly_detected?: boolean;
  failed_payments?: number;
  support_notes_count?: number;
}

export interface CustomerUserDetail {
  id: string;
  email_masked: string;
  plan: string;
  is_suspended: boolean;
  stats: UserStats;
  plan_history?: PlanHistoryEntry[];
  activity_timeline?: ActivityTimelineEntry[];
  flags?: UserFlags;
}

export interface UserNote {
  id: string;
  body: string;
  author_role?: string;
  created_at: string;
  is_flagged?: boolean;
}

export interface RevenueSummary {
  mrr_kobo?: number;
  mrr_naira: string;
  mrr_growth_percent?: number;
  arr_naira?: string;
  arpu_naira?: string;
  churn_rate_percent?: number;
  total_paying_users?: number;
  plan_breakdown?: Record<string, { users: number; mrr_naira: string }>;
}

export interface PlanChangeEntry {
  id?: string;
  user_id?: string;
  email_masked?: string;
  direction?: string;
  from_plan?: string;
  to_plan?: string;
  changed_at?: string;
}

export type AnalyticsPayload = Record<string, unknown>;

export interface SupportFlaggedUser {
  id: string;
  email_masked: string;
  plan?: string;
  reason?: string;
  flagged_at?: string;
}

export interface SupportNote {
  id: string;
  user_id?: string;
  email_masked?: string;
  body: string;
  is_flagged?: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target_plans?: string[];
  send_email?: boolean;
  send_in_app?: boolean;
  created_at?: string;
  sent_at?: string | null;
}

export interface StaffMember {
  id: string;
  email: string;
  role: StaffRole;
  department: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
}

export interface StaffInvite {
  id: string;
  email: string;
  role: StaffRole;
  department?: string;
  created_at: string;
  expires_at?: string;
}

export interface AuditEntry {
  id: string;
  staff_role: string;
  action: string;
  resource?: string;
  resource_id?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  status: string;
  services?: Record<string, ServiceStatusEntry>;
  uptime_seconds?: number;
}

export interface CeleryStatus {
  status: string;
  active_workers?: number;
  queued_tasks?: number;
  failed_tasks_24h?: number;
}

export interface SystemErrorEntry {
  id?: string;
  message: string;
  count?: number;
  last_seen?: string;
  severity?: string;
}
