# Staff dashboard — backend endpoints required

**Audience:** Backend engineers  
**Frontend:** `/staff/*` on `https://www.ryport.com.ng`  
**Base URL:** `https://ryport.onrender.com/staff/api/v1/`  
**Full API spec:** [`staff-api-integration.md`](./staff-api-integration.md)  
**Last updated:** July 2026

This document lists **every endpoint the staff React dashboard needs** to work end-to-end. It is derived from the current frontend routes in `app/staff/` and what is already wired in `lib/staff/api/`.

---

## Table of contents

1. [Infrastructure prerequisites](#1-infrastructure-prerequisites)
2. [API contract (all endpoints)](#2-api-contract-all-endpoints)
3. [Frontend page → endpoint map](#3-frontend-page--endpoint-map)
4. [Implementation status checklist](#4-implementation-status-checklist)
5. [Endpoints by priority](#5-endpoints-by-priority)
6. [Expected response shapes](#6-expected-response-shapes)
7. [Acceptance criteria](#7-acceptance-criteria)

---

## 1. Infrastructure prerequisites

These must be in place before any staff page works reliably.

| Requirement | Detail |
|-------------|--------|
| **Staff JWT** | Separate secret: `STAFF_JWT_SECRET`. Token payload must include `"type": "staff"`. Customer `/api/v1/` tokens must return **401** on staff routes. |
| **CORS** | `STAFF_CORS_ALLOWED_ORIGINS` must include: `https://www.ryport.com.ng`, `http://localhost:3000` |
| **Migrations** | `python manage.py migrate` (staff models, invites, audit, etc.) |
| **Bootstrap admin** | `python manage.py create_superadmin` — creates staff account for initial login |
| **Response envelope** | All responses: `{ "success": true, "data": {...}, "request_id": "uuid" }` or `{ "success": false, "error": { "code", "message" }, "request_id" }` |
| **Pagination** | List endpoints: `{ "results": [], "total_count", "page", "total_pages" }` — default page size **50** |
| **PII masking** | Emails masked in list/detail (`jo***@gmail.com`). No raw transaction rows or per-tx amounts in user detail. |

### Invite link origin

Staff invite emails should point to:

```
https://www.ryport.com.ng/staff/accept-invite?token=<token>
```

(not `staff.ryport.com.ng` — staff UI is on the main domain at `/staff`).

---

## 2. API contract (all endpoints)

Base: **`/staff/api/v1/`**

### Auth — `/staff/login`, `/staff/accept-invite`, `/staff/settings`

| Priority | Method | Path | Auth | Frontend status |
|----------|--------|------|------|-----------------|
| **P0** | POST | `auth/login/` | Public | ✅ Wired |
| **P0** | POST | `auth/refresh/` | Public | ✅ Wired |
| **P0** | POST | `auth/logout/` | Staff JWT | ✅ Wired |
| **P0** | GET | `auth/me/` | Staff JWT | ✅ Wired |
| **P1** | PATCH | `auth/me/` | Staff JWT | ✅ Wired (department only) |
| **P1** | POST | `auth/change-password/` | Staff JWT | ⏳ UI not built yet — needed for Settings |
| **P0** | POST | `staff/accept-invite/` | Public | ✅ Wired |

**Login body:**

```json
{ "email": "ryport@gmail.com", "password": "..." }
```

**Login success (`data`):**

```json
{
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
```

**Critical:** `permissions` object must be populated on login and `GET auth/me/` — the sidebar hides/shows nav items from these flags.

---

### Dashboard — `/staff`

| Priority | Method | Path | Query | Frontend status |
|----------|--------|------|-------|-----------------|
| **P0** | GET | `dashboard/overview/` | — | ✅ Wired (home page) |
| **P2** | GET | `dashboard/charts/user-growth/` | `?days=30` | ⏳ Client ready, charts UI not built |
| **P2** | GET | `dashboard/charts/revenue/` | `?months=12` | ⏳ Client ready |
| **P2** | GET | `dashboard/charts/transactions/` | `?days=30` | ⏳ Client ready |
| **P2** | GET | `dashboard/charts/ai-usage/` | `?days=14` | ⏳ Client ready |

**Overview must return** (inside `data`):

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
    { "id": "uuid", "title": "...", "severity": "warning", "created_at": "2026-07-04T..." }
  ],
  "recent_activity": [
    { "event": "new_signup", "email_masked": "jo***@gmail.com", "plan": "free", "timestamp": "2026-07-04T..." }
  ]
}
```

**Notes for backend:**

- Overview is cached server-side (~5 min) — empty arrays are OK; do not 500 on missing stats.
- `service_status` keys should match integrations the ops team cares about.
- `system_alerts` — alerts are **not** cached as DB objects if that breaks the page; return `[]` when none.

**Chart endpoints** (all return):

```json
{ "labels": ["Jun 1", "Jun 2"], "data": [3, 5] }
```

---

### Users — `/staff/users`, `/staff/users/:id` (detail page planned)

| Priority | Method | Path | Roles | Frontend status |
|----------|--------|------|-------|-----------------|
| **P1** | GET | `users/` | any | ⏳ Page scaffolded |
| **P1** | GET | `users/:user_id/` | any | ⏳ Detail page not built |
| **P1** | POST | `users/:user_id/suspend/` | support, superadmin | ⏳ |
| **P1** | POST | `users/:user_id/unsuspend/` | support, superadmin | ⏳ |
| **P1** | POST | `users/:user_id/reset-password/` | support, superadmin | ⏳ |
| **P2** | PATCH | `users/:user_id/change-plan/` | superadmin | ⏳ |
| **P2** | GET | `users/:user_id/notes/` | any | ⏳ |
| **P2** | POST | `users/:user_id/notes/` | any | ⏳ |
| **P2** | DELETE | `users/:user_id/notes/:note_id/` | superadmin or author | ⏳ |
| **P3** | GET | `users/export/` | engineering, superadmin | ⏳ CSV download |

**List query params:**

| Param | Type | Values |
|-------|------|--------|
| `plan` | string | `free`, `pro`, `advanced` |
| `is_suspended` | boolean | |
| `has_bank_account` | boolean | |
| `date_from` | ISO date | |
| `date_to` | ISO date | |
| `q` | string | email search |
| `sort` | string | `signup_date`, `last_active`, `plan` |
| `page` | int | default 1 |

**List item shape:**

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
  "signed_up_at": "2026-01-15T00:00:00Z",
  "last_active_at": "2026-07-03T00:00:00Z"
}
```

**User detail shape** (stats only — no transaction rows):

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
    { "event": "account_created", "timestamp": "2026-01-15T00:00:00Z" }
  ],
  "flags": {
    "anomaly_detected": false,
    "failed_payments": 0,
    "support_notes_count": 1
  }
}
```

---

### Revenue — `/staff/revenue`

| Priority | Method | Path | Query | Roles | Frontend status |
|----------|--------|------|-------|-------|-----------------|
| **P1** | GET | `revenue/summary/` | — | finance, superadmin | ⏳ Page scaffolded |
| **P2** | GET | `revenue/charts/mrr/` | `?months=12` | finance, superadmin | ⏳ |
| **P2** | GET | `revenue/charts/upgrades/` | `?months=6` | finance, superadmin | ⏳ |
| **P2** | GET | `revenue/plan-changes/` | `direction`, `date_from`, `date_to`, `page` | finance, superadmin | ⏳ |

**Summary shape:**

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

---

### Analytics — `/staff/analytics`

| Priority | Method | Path | Roles | Frontend status |
|----------|--------|------|-------|-----------------|
| **P2** | GET | `analytics/feature-adoption/` | any | ⏳ Page scaffolded |
| **P2** | GET | `analytics/engagement/` | any | ⏳ |
| **P2** | GET | `analytics/ai/` | any | ⏳ |
| **P2** | GET | `analytics/banking/` | any | ⏳ |
| **P2** | GET | `analytics/transactions/` | any | ⏳ |

Frontend will call all five on one page (tabs or sections). Return JSON structures suitable for charts/tables — document exact shapes when implementing; minimum viable is key/value or time-series compatible with `{ labels, data }` pattern.

---

### Support — `/staff/support`

| Priority | Method | Path | Roles | Frontend status |
|----------|--------|------|-------|-----------------|
| **P2** | GET | `support/flagged-users/` | support, superadmin | ⏳ Page scaffolded |
| **P2** | GET | `support/notes/` | support, superadmin | ⏳ `?is_flagged=true` |

---

### Announcements — `/staff/announcements`

| Priority | Method | Path | Roles | Frontend status |
|----------|--------|------|-------|-----------------|
| **P2** | GET | `announcements/` | superadmin | ⏳ Page scaffolded |
| **P2** | POST | `announcements/` | superadmin | ⏳ |
| **P2** | GET | `announcements/:id/` | superadmin | ⏳ |
| **P2** | POST | `announcements/:id/preview/` | superadmin | ⏳ |

**POST body:**

```json
{
  "title": "New Feature: AI CFO",
  "message": "We have launched...",
  "target_plans": ["pro", "advanced"],
  "send_email": true,
  "send_in_app": true
}
```

Valid `target_plans`: `free`, `pro`, `advanced`.

---

### Staff management — `/staff/staff`

| Priority | Method | Path | Roles | Frontend status |
|----------|--------|------|-------|-----------------|
| **P1** | GET | `staff/` | superadmin | ⏳ Page scaffolded |
| **P1** | POST | `staff/invite/` | superadmin | ⏳ |
| **P1** | GET | `staff/invites/` | superadmin | ⏳ |
| **P1** | DELETE | `staff/invites/:invite_id/` | superadmin | ⏳ |
| **P2** | GET | `staff/:staff_id/` | superadmin | ⏳ |
| **P2** | PATCH | `staff/:staff_id/` | superadmin | ⏳ role/department only |
| **P2** | POST | `staff/:staff_id/deactivate/` | superadmin | ⏳ |
| **P2** | POST | `staff/:staff_id/reactivate/` | superadmin | ⏳ |
| **P2** | POST | `staff/:staff_id/reset-password/` | superadmin | ⏳ |

**Invite body:**

```json
{ "email": "jane@example.com", "role": "support", "department": "Customer Success" }
```

Valid roles: `superadmin`, `support`, `finance`, `engineering`.

---

### Audit log — `/staff/audit`

| Priority | Method | Path | Roles | Frontend status |
|----------|--------|------|-------|-----------------|
| **P2** | GET | `audit/` | superadmin | ⏳ Page scaffolded |
| **P3** | GET | `audit/export/` | superadmin | ⏳ CSV download |

**List query params:** `staff_user_id`, `action`, `resource`, `date_from`, `date_to`, `q`, `page`

Audit entries must show **staff role only** — never staff email.

---

### System — `/staff/system`

| Priority | Method | Path | Roles | Frontend status |
|----------|--------|------|-------|-----------------|
| **P1** | GET | `system/health/` | engineering, superadmin | ⏳ Page scaffolded |
| **P1** | GET | `system/celery/` | engineering, superadmin | ⏳ |
| **P2** | GET | `system/errors/` | engineering, superadmin | ⏳ |
| **P2** | GET | `system/alerts/` | engineering, superadmin | ⏳ `?resolved=false` |
| **P2** | POST | `system/alerts/` | engineering, superadmin | ⏳ |
| **P2** | POST | `system/alerts/:alert_id/resolve/` | engineering, superadmin | ⏳ |

**POST alert body:**

```json
{ "title": "...", "message": "...", "severity": "warning" }
```

---

## 3. Frontend page → endpoint map

| Frontend route | Primary endpoints needed |
|----------------|------------------------|
| `/staff/login` | `POST auth/login/` |
| `/staff/accept-invite` | `POST staff/accept-invite/` |
| `/staff` | `GET dashboard/overview/` (+ charts P2) |
| `/staff/users` | `GET users/` |
| `/staff/users/:id` | `GET users/:id/`, suspend/unsuspend, notes |
| `/staff/revenue` | `GET revenue/summary/`, MRR/upgrades charts |
| `/staff/analytics` | All `analytics/*` endpoints |
| `/staff/support` | `GET support/flagged-users/`, `support/notes/` |
| `/staff/announcements` | CRUD `announcements/` |
| `/staff/staff` | `staff/`, `staff/invite/`, `staff/invites/` |
| `/staff/audit` | `GET audit/`, export |
| `/staff/system` | `system/health/`, `celery/`, `errors/`, `alerts/` |
| `/staff/settings` | `GET/PATCH auth/me/`, `POST auth/change-password/` |

---

## 4. Implementation status checklist

Use this as a backend sprint board. Frontend column reflects `lib/staff/api/` + UI wiring.

### Legend

- ✅ Frontend wired — backend must respond correctly
- ⏳ Frontend page exists but API not wired yet — backend can implement in parallel
- ❌ Not started on either side

| Endpoint | Backend | Frontend API | Frontend UI |
|----------|---------|--------------|-------------|
| `POST auth/login/` | ? | ✅ | ✅ |
| `POST auth/refresh/` | ? | ✅ | ✅ |
| `POST auth/logout/` | ? | ✅ | ✅ |
| `GET auth/me/` | ? | ✅ | ✅ |
| `PATCH auth/me/` | ? | ✅ | ✅ |
| `POST auth/change-password/` | ? | ❌ | ❌ |
| `POST staff/accept-invite/` | ? | ✅ | ✅ |
| `GET dashboard/overview/` | ? | ✅ | ✅ |
| `GET dashboard/charts/*` (×4) | ? | ✅ | ❌ |
| `GET users/` | ? | ❌ | ⏳ scaffold |
| `GET users/:id/` + actions | ? | ❌ | ❌ |
| `GET revenue/*` | ? | ❌ | ⏳ scaffold |
| `GET analytics/*` (×5) | ? | ❌ | ⏳ scaffold |
| `GET support/*` | ? | ❌ | ⏳ scaffold |
| `GET/POST announcements/*` | ? | ❌ | ⏳ scaffold |
| `GET/POST staff/*` | ? | ❌ | ⏳ scaffold |
| `GET audit/*` | ? | ❌ | ⏳ scaffold |
| `GET/POST system/*` | ? | ❌ | ⏳ scaffold |

---

## 5. Endpoints by priority

### P0 — Must work for staff to log in and see home

1. `POST auth/login/`
2. `POST auth/refresh/`
3. `POST auth/logout/`
4. `GET auth/me/` (with full `permissions` object)
5. `POST staff/accept-invite/`
6. `GET dashboard/overview/`

**Blockers seen in production:**

- Login returns **401** `invalid_credentials` when email has no **staff profile** (customer account ≠ staff account).
- Run `create_superadmin` or invite staff before testing `/staff/login`.

### P1 — Core ops workflows

7. `PATCH auth/me/`
8. `GET users/` + pagination/filters
9. `GET users/:user_id/`
10. `POST users/:user_id/suspend/` / `unsuspend/`
11. `GET revenue/summary/`
12. `GET system/health/` + `GET system/celery/`
13. `GET staff/`, `POST staff/invite/`, `GET staff/invites/`

### P2 — Full dashboard feature set

14. Dashboard charts (×4)
15. Revenue charts + plan-changes
16. Analytics (×5)
17. Support queue
18. Announcements CRUD
19. Staff detail + deactivate/reactivate
20. Audit log
21. System errors + alerts management
22. User notes, change-plan, reset-password

### P3 — Exports

23. `GET users/export/` (CSV)
24. `GET audit/export/` (CSV)

---

## 6. Expected response shapes

### Success envelope (required on every 2xx JSON response)

```json
{
  "success": true,
  "data": { },
  "request_id": "850ea17e-4982-465d-a02c-baa5bfd76910"
}
```

### Error envelope

```json
{
  "success": false,
  "error": {
    "code": "invalid_credentials",
    "message": "Invalid email or password."
  },
  "request_id": "850ea17e-4982-465d-a02c-baa5bfd76910"
}
```

### Error codes the frontend handles

| Code | HTTP | When |
|------|------|------|
| `invalid_credentials` | 401 | Wrong email/password or no staff profile |
| `invalid_token` | 401 | Expired/revoked JWT |
| `insufficient_permissions` | 403 | Role gate failed |
| `not_found` | 404 | Missing resource |
| `validation_error` | 400 | Bad request body |
| `conflict` | 409 | e.g. invite already accepted |
| `login_locked` | 429 | 5 failed logins / IP / 15 min |
| `internal_error` | 500 | Server error — include `request_id` |

### Paginated list envelope (inside `data`)

```json
{
  "results": [ ],
  "total_count": 1240,
  "page": 1,
  "total_pages": 25
}
```

---

## 7. Acceptance criteria

Backend is **ready for frontend integration** when:

### Auth

- [ ] Staff user created via `create_superadmin` can log in at `/staff/login`
- [ ] Customer `/api/v1/` token rejected on staff routes with 401
- [ ] `GET auth/me/` returns all 10 `permissions.*` booleans
- [ ] Refresh token flow works (8h access / 7d refresh)
- [ ] Invite email links to `https://www.ryport.com.ng/staff/accept-invite?token=...`

### Dashboard

- [ ] `GET dashboard/overview/` returns 200 with all keys (empty arrays OK)
- [ ] Overview survives empty stats / cache rebuild without 500
- [ ] Chart endpoints return `{ labels, data }` even when empty

### CORS

- [ ] Preflight from `https://www.ryport.com.ng` returns `access-control-allow-origin`
- [ ] Preflight from `http://localhost:3000` works for local dev

### Role gates

- [ ] Finance-only routes return 403 for `support` role
- [ ] System routes return 403 for non-engineering roles
- [ ] Staff management returns 403 for non-superadmin

### Security

- [ ] PII masked in user list/detail
- [ ] User detail has aggregates only — no transaction rows
- [ ] Audit log never exposes staff email

---

## Quick test commands

Replace credentials with a valid staff account after `create_superadmin`:

```bash
# Login
curl -s -X POST "https://ryport.onrender.com/staff/api/v1/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_STAFF_EMAIL","password":"YOUR_STAFF_PASSWORD"}'

# Overview (use access token from login)
curl -s "https://ryport.onrender.com/staff/api/v1/dashboard/overview/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# CORS check
curl -s -I -X OPTIONS "https://ryport.onrender.com/staff/api/v1/auth/login/" \
  -H "Origin: https://www.ryport.com.ng" \
  -H "Access-Control-Request-Method: POST"
```

---

## Related docs

| Document | Purpose |
|----------|---------|
| [`staff-api-integration.md`](./staff-api-integration.md) | Full API reference (frontend engineers) |
| [`frontend-dev-handoff.md`](./frontend-dev-handoff.md) | Customer app (separate from staff) |
| `lib/staff/api/types.ts` | TypeScript types frontend expects |
| `app/staff/` | Staff dashboard routes |

When an endpoint is implemented and verified, notify frontend — we will wire the corresponding page in `lib/staff/api/` and replace scaffold placeholders.
