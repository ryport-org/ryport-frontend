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
  severity: string;
  created_at: string;
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

export interface ChartData {
  labels: string[];
  data: number[];
}
