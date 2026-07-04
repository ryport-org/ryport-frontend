# Ryport Staff API — Frontend Integration Guide

**Audience:** Frontend engineers building the staff dashboard at `https://www.ryport.com.ng/staff`  
**Backend API:** `https://ryport.onrender.com/staff/api/v1/`  
**Endpoint map:** [`staff-frontend-endpoints.md`](./staff-frontend-endpoints.md)  
**Backend requirements:** [`staff-dashboard-backend-requirements.md`](./staff-dashboard-backend-requirements.md)  
**Last updated:** July 2026

This document is the integration reference for the **Staff REST API** — a completely separate API from the customer app at `/api/v1/`. Do not use customer Supabase tokens on staff endpoints. Do not use Django admin or `/ryport-ops/` from React.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Environment setup](#2-environment-setup)
3. [Security rules](#3-security-rules)
4. [API conventions](#4-api-conventions)
5. [Authentication](#5-authentication)
6. [Roles & permissions](#6-roles--permissions)
7. [App bootstrap](#7-app-bootstrap)
8. [Suggested sitemap & page wiring](#8-suggested-sitemap--page-wiring)
9. [Complete endpoint reference](#9-complete-endpoint-reference)
10. [Response shapes (key endpoints)](#10-response-shapes-key-endpoints)
11. [Error handling](#11-error-handling)
12. [TypeScript types](#12-typescript-types)
13. [What NOT to build in React](#13-what-not-to-build-in-react)
14. [Deployment checklist](#14-deployment-checklist)
15. [Test credentials](#15-test-credentials)

---

## 1. Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Staff frontend (YOU BUILD THIS)                                 │
│  Next.js / React @ www.ryport.com.ng/staff                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS + Staff JWT Bearer
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Staff REST API (Render)                                         │
│  /staff/api/v1/*  — internal operations only                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
              PostgreSQL · Redis · Celery · Resend
              (same backend as customer app, different auth layer)
```

| System | URL | Use in staff React app? |
|--------|-----|-------------------------|
| **Staff API** | `/staff/api/v1/` | ✅ Yes — this doc |
| Customer API | `/api/v1/` | ❌ No — customer tokens rejected |
| Ops dashboard (Django templates) | `/ryport-ops/` | ❌ No — legacy server-rendered UI |
| Django admin | `/admin/` | ❌ No |

---

## 2. Environment setup

### Production

```env
NEXT_PUBLIC_STAFF_API_URL=https://ryport.onrender.com
NEXT_PUBLIC_STAFF_APP_URL=https://www.ryport.com.ng
```

All staff API calls:

```
${NEXT_PUBLIC_STAFF_API_URL}/staff/api/v1/...
```

Staff UI routes live under `/staff/*` on the main domain.

### Local development

```env
NEXT_PUBLIC_STAFF_API_URL=http://localhost:8000
NEXT_PUBLIC_STAFF_APP_URL=http://localhost:3000
```

CORS is configured for:

- `https://www.ryport.com.ng`
- `http://localhost:3000`

---

## 3. Security rules

These are enforced server-side — your UI should mirror them for UX, not rely on them for security.

| Rule | Detail |
|------|--------|
| Separate JWT | Staff tokens use `STAFF_JWT_SECRET`, not Supabase/customer JWT |
| Token type | Payload must include `"type": "staff"` — customer tokens return **401** |
| Masked PII | Emails: `jo***@gmail.com`. IPs: `197.210.***.***`. Names partially masked |
| No raw financials | User detail returns **counts and aggregates only** — never transaction rows or amounts per tx |
| Audit logging | Every authenticated staff action is logged automatically |
| Rate limits | **100 req/min** per staff user; login lockout after **5 failed attempts per IP** (15 min) |
| Role gates | Revenue = finance+; system health = engineering+; staff management = superadmin only |

---

## 4. API conventions

### Success envelope

Every successful response:

```json
{
  "success": true,
  "data": { },
  "request_id": "uuid"
}
```

`request_id` may be omitted if not set by middleware — log it when present for support tickets.

### Error envelope

```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to perform this action."
  },
  "request_id": "uuid"
}
```

### Authenticated requests

```http
Authorization: Bearer <staff-access-token>
Content-Type: application/json
```

### Pagination (where applicable)

List endpoints return:

```json
{
  "results": [],
  "total_count": 1240,
  "page": 1,
  "total_pages": 25
}
```

Default page size: **50**.

### Money display

- Raw kobo integers may appear in KPI fields (e.g. `mrr_kobo`)
- Pre-formatted Naira strings are also provided (e.g. `mrr_naira: "₦245,000"`)
- Prefer the formatted strings for display; use kobo for charts/calculations

---

## 5. Authentication

Staff auth is **email + password** against Django staff accounts — not Supabase.

### Login (public)

```http
POST /staff/api/v1/auth/login/
Content-Type: application/json

{
  "email": "ryport@gmail.com",
  "password": "..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "access": "<staff-jwt>",
    "refresh": "<staff-refresh-jwt>",
    "staff_user": {
      "id": "uuid",
      "email": "ry***@gmail.com",
      "role": "superadmin",
      "department": "Operations",
      "is_active": true,
      "permissions": {
        "can_manage_staff": true,
        "can_view_revenue": true,
        "can_suspend_users": true,
        "can_view_system": true,
        "can_send_announcements": true,
        "can_view_audit_log": true,
        "can_export_users": true,
        "can_change_plans": true,
        "can_view_analytics": true,
        "can_view_dashboard": true
      },
      "last_login_at": "2026-07-04T09:00:00Z",
      "created_at": "2026-07-01T00:00:00Z"
    }
  }
}
```

**Token TTL:** access = 8 hours · refresh = 7 days

Store both tokens securely (httpOnly cookie or secure storage). Attach `access` to every request.

### Refresh (public)

```http
POST /staff/api/v1/auth/refresh/
{ "refresh": "<staff-refresh-jwt>" }
```

Returns `{ "access": "<new-access-token>" }`.

### Logout (authenticated)

```http
POST /staff/api/v1/auth/logout/
Authorization: Bearer <access>
{ "refresh": "<staff-refresh-jwt>" }
```

Blacklists the refresh token server-side.

### Current profile (authenticated)

```http
GET  /staff/api/v1/auth/me/
PATCH /staff/api/v1/auth/me/
```

PATCH body (own profile only — cannot change role):

```json
{ "department": "Operations" }
```

### Change password (authenticated)

```http
POST /staff/api/v1/auth/change-password/
{
  "current_password": "...",
  "new_password": "...",
  "confirm_password": "..."
}
```

Invalidates all active staff sessions on success.

### Accept invite (public — no auth)

Used on `/accept-invite?token=...` page:

```http
POST /staff/api/v1/staff/accept-invite/
{
  "token": "<64-char-hex>",
  "password": "min-8-chars",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

Returns tokens + auto-login (same shape as login). `first_name` / `last_name` are accepted but not stored on `CustomUser` today.

### Login error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `invalid_credentials` | 401 | Wrong email/password or no staff profile |
| `login_locked` | 429 | Too many failed attempts from this IP |
| `invalid_token` | 401 | Expired or revoked refresh token |

---

## 6. Roles & permissions

### Roles

| Role | Slug | Typical use |
|------|------|-------------|
| Super Admin | `superadmin` | Full access, staff invites, announcements, audit |
| Customer Support | `support` | User lookup, suspend/unsuspend, notes |
| Finance | `finance` | Revenue, MRR, plan change logs |
| Engineering | `engineering` | System health, Celery, errors, user export |

Superadmin bypasses all role checks.

### Permission flags (`GET /auth/me/`)

Use these to show/hide nav items:

| Flag | Roles |
|------|-------|
| `can_manage_staff` | superadmin |
| `can_view_revenue` | superadmin, finance |
| `can_suspend_users` | support, superadmin |
| `can_view_system` | superadmin, engineering |
| `can_send_announcements` | superadmin |
| `can_view_audit_log` | superadmin |
| `can_export_users` | superadmin, engineering |
| `can_change_plans` | superadmin |
| `can_view_analytics` | all staff |
| `can_view_dashboard` | all staff |

On **403**, show a generic “You don’t have access” — do not expose endpoint details.

---

## 7. App bootstrap

After login, load in this order:

| Step | Endpoint | Purpose |
|------|----------|---------|
| 1 | `GET /auth/me/` | Profile + permission flags for nav gating |
| 2 | `GET /dashboard/overview/` | Home page KPIs, alerts, recent activity (cached 5 min server-side) |
| 3 | Role-specific | Finance → revenue summary; Engineering → system health |

Refresh access token proactively before expiry (8h) or on **401** with a single retry after refresh.

---

## 8. Suggested sitemap & page wiring

| Page | Route (frontend) | Primary API |
|------|------------------|-------------|
| Login | `/staff/login` | `POST /auth/login/` |
| Accept invite | `/staff/accept-invite` | `POST /staff/accept-invite/` |
| Dashboard | `/staff` | `GET /dashboard/overview/` |
| Users list | `/staff/users` | `GET /users/?plan=&is_suspended=&q=&sort=` |
| User detail | `/staff/users/:id` | `GET /users/:id/`, notes, suspend actions |
| Revenue | `/staff/revenue` | `GET /revenue/summary/`, MRR chart |
| Analytics | `/staff/analytics` | feature-adoption, engagement, ai, banking, transactions |
| Support queue | `/staff/support` | `GET /support/flagged-users/`, `/support/notes/` |
| Announcements | `/staff/announcements` | CRUD + preview (superadmin) |
| Staff management | `/staff/staff` | list, invite, deactivate (superadmin) |
| Audit log | `/staff/audit` | `GET /audit/` (superadmin) |
| System | `/staff/system` | health, celery, errors, alerts (engineering+) |
| Settings | `/staff/settings` | `GET/PATCH /auth/me/`, change password |

### Dashboard charts

| Chart | Endpoint | Query |
|-------|----------|-------|
| User growth | `GET /dashboard/charts/user-growth/` | `?days=30` |
| Revenue | `GET /dashboard/charts/revenue/` | `?months=12` |
| Transactions | `GET /dashboard/charts/transactions/` | `?days=30` |
| AI usage | `GET /dashboard/charts/ai-usage/` | `?days=14` |

---

## 9. Complete endpoint reference

Base: `/staff/api/v1/`

### Auth

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `auth/login/` | Public | — |
| POST | `auth/refresh/` | Public | — |
| POST | `auth/logout/` | Staff JWT | any |
| GET | `auth/me/` | Staff JWT | any |
| PATCH | `auth/me/` | Staff JWT | any |
| POST | `auth/change-password/` | Staff JWT | any |

### Staff management (superadmin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `staff/` | List staff (`?role=`, `?is_active=`) |
| POST | `staff/invite/` | Invite `{ email, role, department }` |
| GET | `staff/invites/` | Pending invites |
| DELETE | `staff/invites/:invite_id/` | Revoke invite |
| POST | `staff/accept-invite/` | Accept invite (public) |
| GET | `staff/:staff_id/` | Staff detail + recent audit |
| PATCH | `staff/:staff_id/` | Update role/department (not own role) |
| POST | `staff/:staff_id/deactivate/` | Deactivate (not self) |
| POST | `staff/:staff_id/reactivate/` | Reactivate |
| POST | `staff/:staff_id/reset-password/` | Send reset email |

### Dashboard

| Method | Path | Roles |
|--------|------|-------|
| GET | `dashboard/overview/` | any |
| GET | `dashboard/charts/user-growth/` | any |
| GET | `dashboard/charts/revenue/` | any |
| GET | `dashboard/charts/transactions/` | any |
| GET | `dashboard/charts/ai-usage/` | any |

### Users

| Method | Path | Roles |
|--------|------|-------|
| GET | `users/` | any |
| GET | `users/export/` | engineering, superadmin |
| GET | `users/:user_id/` | any |
| POST | `users/:user_id/suspend/` | support, superadmin |
| POST | `users/:user_id/unsuspend/` | support, superadmin |
| POST | `users/:user_id/reset-password/` | support, superadmin |
| PATCH | `users/:user_id/change-plan/` | superadmin |
| GET | `users/:user_id/notes/` | any |
| POST | `users/:user_id/notes/` | any |
| DELETE | `users/:user_id/notes/:note_id/` | superadmin or note author |

**User list filters:** `plan`, `is_suspended`, `has_bank_account`, `date_from`, `date_to`, `q` (email search), `sort` (`signup_date`, `last_active`, `plan`), `page`

### Revenue (finance + superadmin)

| Method | Path |
|--------|------|
| GET | `revenue/summary/` |
| GET | `revenue/charts/mrr/?months=12` |
| GET | `revenue/charts/upgrades/?months=6` |
| GET | `revenue/plan-changes/?direction=upgrade&date_from=&date_to=&page=` |

### Analytics (any staff)

| Method | Path |
|--------|------|
| GET | `analytics/feature-adoption/` |
| GET | `analytics/engagement/` |
| GET | `analytics/ai/` |
| GET | `analytics/banking/` |
| GET | `analytics/transactions/` |

### System (engineering + superadmin)

| Method | Path |
|--------|------|
| GET | `system/health/` |
| GET | `system/celery/` |
| GET | `system/errors/` |
| GET | `system/alerts/?resolved=false` |
| POST | `system/alerts/` `{ title, message, severity }` |
| POST | `system/alerts/:alert_id/resolve/` |

### Announcements (superadmin)

| Method | Path |
|--------|------|
| GET | `announcements/` |
| POST | `announcements/` |
| GET | `announcements/:id/` |
| POST | `announcements/:id/preview/` |

POST body:

```json
{
  "title": "New Feature: AI CFO",
  "message": "We have launched...",
  "target_plans": ["pro", "advanced"],
  "send_email": true,
  "send_in_app": true
}
```

Valid plans: `free`, `pro`, `advanced`.

### Audit (superadmin)

| Method | Path |
|--------|------|
| GET | `audit/?staff_user_id=&action=&resource=&date_from=&date_to=&q=&page=` |
| GET | `audit/export/?date_from=&date_to=` | CSV download |

Audit entries show **staff role only** — never staff email.

### Support (support + superadmin)

| Method | Path |
|--------|------|
| GET | `support/flagged-users/` |
| GET | `support/notes/?is_flagged=true` |

---

## 10. Response shapes (key endpoints)

### Dashboard overview

```json
{
  "kpis": {
    "total_users": 1240,
    "active_users_today": 87,
    "new_users_this_week": 43,
    "new_users_this_month": 167,
    "mrr_kobo": 24500000,
    "mrr_naira": "₦245,000",
    "arr_naira": "₦2,940,000",
    "total_transactions": 89432,
    "ai_messages_today": 234,
    "active_bank_connections": 389
  },
  "plan_distribution": { "free": 1050, "pro": 156, "advanced": 34 },
  "service_status": {
    "django": { "status": "ok", "response_ms": 12 },
    "postgres": { "status": "ok", "response_ms": 8 },
    "redis": { "status": "ok", "memory_used": "12MB" },
    "celery": { "status": "ok", "active_workers": 2 },
    "mono": { "status": "ok" },
    "resend": { "status": "ok" }
  },
  "system_alerts": [
    { "id": "uuid", "title": "...", "severity": "warning", "created_at": "..." }
  ],
  "recent_activity": [
    { "event": "new_signup", "email_masked": "jo***@gmail.com", "plan": "free", "timestamp": "..." }
  ]
}
```

### User list item

```json
{
  "id": "uuid",
  "email_masked": "jo***@gmail.com",
  "first_name": "Jo**",
  "plan": "pro",
  "plan_badge": "Pro",
  "is_suspended": false,
  "is_2fa_enabled": true,
  "bank_accounts_count": 2,
  "transactions_count": 145,
  "signed_up_at": "2026-01-15T...",
  "last_active_at": "2026-07-03T..."
}
```

### User detail (stats only)

```json
{
  "id": "uuid",
  "email_masked": "jo***@gmail.com",
  "plan": "pro",
  "is_suspended": false,
  "stats": {
    "total_transactions": 145,
    "total_bank_accounts": 2,
    "total_budgets": 4,
    "total_ai_messages_lifetime": 230
  },
  "plan_history": [
    { "plan": "free", "started_at": "2026-01-15", "ended_at": "2026-03-01" }
  ],
  "activity_timeline": [
    { "event": "account_created", "timestamp": "..." }
  ],
  "flags": {
    "anomaly_detected": false,
    "failed_payments": 0,
    "support_notes_count": 1
  }
}
```

### Revenue summary

```json
{
  "mrr_kobo": 24500000,
  "mrr_naira": "₦245,000",
  "mrr_growth_percent": 12.4,
  "arr_naira": "₦2,940,000",
  "arpu_naira": "₦1,286",
  "churn_rate_percent": 2.1,
  "total_paying_users": 190,
  "plan_breakdown": {
    "pro": { "users": 156, "mrr_naira": "₦780,000" },
    "advanced": { "users": 34, "mrr_naira": "₦510,000" }
  }
}
```

### Chart endpoints

All chart endpoints return:

```json
{ "labels": ["Jun 1", "Jun 2"], "data": [3, 5] }
```

---

## 11. Error handling

| Code | HTTP | Action in UI |
|------|------|--------------|
| `invalid_credentials` | 401 | Show login error |
| `invalid_token` | 401 | Try refresh once, then redirect to login |
| `insufficient_permissions` | 403 | Hide action or show access denied |
| `not_found` | 404 | User/staff/resource not found |
| `validation_error` | 400 | Show field errors |
| `conflict` | 409 | e.g. invite already accepted |
| `login_locked` | 429 | Show lockout message with retry hint |
| `internal_error` | 500 | Generic error + `request_id` for support |

Implement a global fetch wrapper:

1. Attach `Authorization: Bearer ${access}`
2. On 401 → refresh → retry once
3. On 403 with `insufficient_permissions` → do not retry
4. Surface `error.message` to the user; log `request_id`

---

## 12. TypeScript types

```typescript
export type StaffRole = 'superadmin' | 'support' | 'finance' | 'engineering';

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
  email: string; // masked
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

export interface ApiSuccess<T> {
  success: true;
  data: T;
  request_id?: string;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
  request_id?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

Suggested API client base:

```typescript
const BASE = process.env.NEXT_PUBLIC_STAFF_API_URL + '/staff/api/v1';

export async function staffFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  });
  const body = await res.json();
  if (!body.success) throw body as ApiError;
  return body as ApiSuccess<T>;
}
```

---

## 13. What NOT to build in React

| URL | Reason |
|-----|--------|
| `/api/v1/*` with customer token | Wrong auth system — will fail or leak wrong data model |
| `/ryport-ops/` | Legacy Django ops UI — replaced by `/staff` on www.ryport.com.ng |
| `/admin/` | Django admin — not for dashboard UX |

The staff frontend should **only** talk to `/staff/api/v1/`.

---

## 14. Deployment checklist

Backend (Render):

- [ ] `STAFF_JWT_SECRET` set (generate: `python -c "import secrets; print(secrets.token_hex(50))"`)
- [ ] `STAFF_CORS_ALLOWED_ORIGINS` includes production staff URL
- [ ] `python manage.py migrate` run
- [ ] `python manage.py create_superadmin` run once

Frontend (`www.ryport.com.ng/staff`):

- [ ] `NEXT_PUBLIC_STAFF_API_URL=https://ryport.onrender.com`
- [ ] Staff routes deployed at `/staff/*` on main Next.js app
- [ ] Login, invite accept, and token refresh flows implemented
- [ ] Nav gated by `permissions` from `/auth/me/`

---

## 15. Test credentials

After backend deploy, run:

```bash
python manage.py sync_staff_api_profiles
python manage.py create_superadmin --email ryport@ryport.com.ng
```

| Field | Value |
|-------|-------|
| Email | `ryport@ryport.com.ng` (ops account) or `ryport@gmail.com` (seed) |
| Password | Same as `/ryport-ops/` — **not** the customer app password |
| Role | `superadmin` |

**401 on login?** Run `sync_staff_api_profiles`, verify ops password, or clear lockout:

```bash
python manage.py clear_staff_login_lockouts --all
```

Invite link format:

```
https://www.ryport.com.ng/staff/accept-invite?token=<token>
```

---

## Related docs

| Doc | Audience |
|-----|----------|
| [`staff-frontend-endpoints.md`](./staff-frontend-endpoints.md) | Frontend endpoint map (start here) |
| [`staff-dashboard-backend-requirements.md`](./staff-dashboard-backend-requirements.md) | Backend sprint checklist |
| [`frontend-integration.md`](./frontend-integration.md) | Customer app |
| [`frontend-dev-handoff.md`](./frontend-dev-handoff.md) | Customer app quick start |
| **This file** | Staff API full reference |

**Implementation:** `app/staff/`, `lib/staff/`, `components/staff/`
