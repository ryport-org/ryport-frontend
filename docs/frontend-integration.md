# Ryport — Complete Frontend Integration Handoff

**Audience:** Frontend engineers building the Ryport customer web app (Next.js / React recommended).  
**Backend repo:** `fluxaro/ryport`  
**Last updated:** July 2026

This document is the **single source of truth** for every page to build, every API endpoint, plan gating, auth flows, Nigerian money rules, and backend capabilities. Read it end-to-end before writing UI code.

> **OAuth (important):** Use **backend-initiated OAuth** via `GET /api/v1/users/auth/oauth/{provider}/` — not Supabase OAuth directly from the browser. Section 6.4 below reflects the correct flow. **Do not** call Supabase OAuth from the frontend. In this repo, OAuth UI is **temporarily disabled** (see commented code in `components/auth/social-logins.tsx`, `components/auth/oauth-handler.tsx`); re-enable when backend OAuth is confirmed live on Render.

---

## Table of contents

1. [Production API & fixing the 400 error](#1-production-api--fixing-the-400-error)
2. [What the backend is (infrastructure map)](#2-what-the-backend-is-infrastructure-map)
3. [What is NOT the customer frontend](#3-what-is-not-the-customer-frontend)
4. [Frontend environment setup](#4-frontend-environment-setup)
5. [API conventions](#5-api-conventions)
6. [Authentication (all flows)](#6-authentication-all-flows)
7. [Bootstrap & global app state](#7-bootstrap--global-app-state)
8. [Subscription plans & gating](#8-subscription-plans--gating)
9. [Nigerian financial rules](#9-nigerian-financial-rules)
10. [Complete app sitemap — every page to build](#10-complete-app-sitemap--every-page-to-build)
11. [Page-by-page UI sections & API wiring](#11-page-by-page-ui-sections--api-wiring)
12. [Complete API reference (all endpoints)](#12-complete-api-reference-all-endpoints)
13. [AI features (detailed)](#13-ai-features-detailed)
14. [Mono bank linking](#14-mono-bank-linking)
15. [Paystack upgrade / billing](#15-paystack-upgrade--billing)
16. [Notifications & email deep links](#16-notifications--email-deep-links)
17. [Background jobs that affect UX](#17-background-jobs-that-affect-ux)
18. [Error handling](#18-error-handling)
19. [Suggested frontend architecture](#19-suggested-frontend-architecture)
20. [TypeScript types](#20-typescript-types)
21. [Gaps & backend-only features](#21-gaps--backend-only-features)
22. [Related docs](#22-related-docs)

---

## 1. Production API & fixing the 400 error

### Production base URL

```
https://ryport.onrender.com
```

| Purpose | URL |
|---------|-----|
| **API prefix** | `https://ryport.onrender.com/api/v1/` |
| **Liveness probe** | `GET https://ryport.onrender.com/api/health/live/` |
| **Full health** | `GET https://ryport.onrender.com/api/health/` |
| **Django admin** | `https://ryport.onrender.com/admin/` (staff only — not your app) |
| **Internal ops dashboard** | `https://ryport.onrender.com/ryport-ops/` (staff only — server-rendered, not React) |

### Why `https://ryport.onrender.com/` shows **Bad Request (400)**

This is **not** a missing route. Django returns **400** when the request `Host` header is **not** in `ALLOWED_HOSTS`. The API process is running (gunicorn responds), but Django rejects the host before any view runs — including `/api/health/live/`.

**Fix on Render → Web Service → Environment:**

```env
ALLOWED_HOSTS=ryport.onrender.com,ryport.com.ng,www.ryport.com.ng
```

Also set CORS so your frontend can call the API:

```env
CORS_ALLOWED_ORIGINS=https://app.ryport.com.ng,https://ryport.com.ng,http://localhost:3000
FRONTEND_URL=https://app.ryport.com.ng
```

Redeploy after saving. Verify:

```bash
curl -s https://ryport.onrender.com/api/health/live/
# Expected: {"status":"ok"}
```

### Frontend env

```env
NEXT_PUBLIC_API_URL=https://ryport.onrender.com
# All requests go to ${NEXT_PUBLIC_API_URL}/api/v1/...
NEXT_PUBLIC_APP_URL=https://app.ryport.com.ng
```

**Never** call the API root `/` for JSON — there is no customer homepage on the API server. Always use `/api/v1/...`.

---

## 2. What the backend is (infrastructure map)

```
┌─────────────────────────────────────────────────────────────────┐
│  Customer frontend (YOU BUILD THIS)                              │
│  Next.js / React @ app.ryport.com.ng                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS + JWT Bearer
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Django REST API (Render)                                        │
│  /api/v1/*  — all customer features                              │
│  /api/health/* — probes                                          │
└───┬─────────┬─────────┬─────────┬─────────┬─────────┬───────────┘
    │         │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼         ▼
 PostgreSQL  Redis    Celery    Supabase   Mono     Paystack
 (Supabase)  (Upstash) workers  Auth      open     payments
                              + Realtime  banking
    │
    ▼
 Claude (Anthropic) — AI chat, CFO, categorisation, cash flow
 Resend — transactional emails (21 HTML templates)
 Sentry — error monitoring (optional)
```

### Django apps → customer features

| App | Customer-facing capability |
|-----|---------------------------|
| `users` | Register, login, OAuth, OTP, 2FA, profile, plan |
| `accounts` | Mono bank linking, sync, disconnect |
| `transactions` | List/create/delete txns, rule categorise, receipt upload |
| `budgets` | CRUD, usage, threshold alerts |
| `reports` | Monthly/weekly/P&L generate, view, export PDF/CSV/XLSX |
| `notifications` | In-app inbox, unread count, mark read |
| `ai` | Chat, quota, conversations, CFO, cash flow, subscriptions, smart budgets, AI categorise |
| `businesses` | Multi-business, analytics, active business switch |
| `teams` | Invites preview/accept/list/revoke |
| `integrations` | API keys (Advanced), external `/external/me/` |

### Cross-cutting backend behaviour (frontend should know)

| Mechanism | Effect on frontend |
|-----------|-------------------|
| **JWT** (30 min access, 7 day refresh, rotation) | Refresh before expiry; logout blacklists refresh |
| **Plan middleware** | Every request has plan context server-side; gates return 403 |
| **AI throttle** | Free: 10 AI messages/day → 429 with `quota_exceeded` |
| **Idempotency** | Manual txn create **requires** unique `idempotency_key` per submit |
| **Kobo storage** | All amounts integers; divide by 100 for display |
| **Audit trail** | Backend-only; no customer API |
| **Field encryption** | Account numbers never returned in full — masked only |
| **Request ID** | `X-Request-ID` echoed on responses — show in support UI |

### Test coverage (backend confidence)

157+ pytest tests including full endpoint integration, AI, auth, email, admin dashboard.

---

## 3. What is NOT the customer frontend

| URL | What it is |
|-----|------------|
| `/ryport-ops/` | **Internal ops dashboard** — Django templates, staff login, Chart.js. Built for CS/engineering. **Do not rebuild in React.** |
| `/admin/` | Django default admin — dev/staff only |
| `/api/v1/integrations/webhooks/*` | Paystack/Mono webhooks — server-to-server only |
| `/api/v1/accounts/webhooks/mono/` | Legacy Mono webhook path |

---

## 4. Frontend environment setup

```env
NEXT_PUBLIC_API_URL=https://ryport.onrender.com
NEXT_PUBLIC_APP_URL=https://app.ryport.com.ng
NEXT_PUBLIC_MONO_PUBLIC_KEY=<from Mono dashboard>
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<from Paystack dashboard>
```

Backend must have matching `FRONTEND_URL` for OAuth redirects, team invite emails, and email CTAs.

### Required headers (authenticated requests)

```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: <uuid-v4>   # optional but recommended
```

### Token storage

| Token | TTL | Storage recommendation |
|-------|-----|------------------------|
| `access` | 30 min | Memory or short-lived secure cookie |
| `refresh` | 7 days | HttpOnly secure cookie |

---

## 5. API conventions

### Success envelope

```json
{
  "success": true,
  "data": { }
}
```

### Error envelope

```json
{
  "success": false,
  "error": {
    "code": "feature_not_available",
    "message": "Human-readable message.",
    "details": {}
  },
  "request_id": "abc-123"
}
```

### Special response types

| Case | Behavior |
|------|----------|
| `DELETE` account/transaction | `204 No Content` — no JSON body |
| Report export | Raw file stream + `Content-Disposition: attachment` |
| Receipt upload | `multipart/form-data`, field name: `receipt` |
| Health endpoints | DRF direct JSON (no `success` wrapper on `/api/health/`) |

### Transaction pagination (cursor only)

```
GET /api/v1/transactions/?cursor=<opaque>&page_size=50
     &date_from=2026-01-01&date_to=2026-06-30
     &category=Food&type=expense&account_id=<uuid>
```

```json
{
  "success": true,
  "data": {
    "next": "https://...?cursor=...",
    "previous": null,
    "page_size": 50,
    "results": [ /* Transaction[] */ ]
  }
}
```

All other list endpoints return a plain array in `data` (no cursor).

---

## 6. Authentication (all flows)

### 6.1 Email + password register

```
POST /api/v1/users/auth/register/
{
  "email": "user@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
→ 201 { success, data: { id, email, plan, access, refresh } }
```

### 6.2 Email + password login

```
POST /api/v1/users/auth/login/
{ "email", "password", "totp_token"? }

→ 200 { id, email, plan, access, refresh, is_2fa_enabled }
→ 403 { error.code: "two_factor_required" } → show TOTP input, retry with totp_token
```

### 6.3 Email OTP (passwordless)

```
POST /api/v1/users/auth/otp/request/   { "email" }
→ { message: "If an account exists, a verification code has been sent." }

POST /api/v1/users/auth/otp/verify/    { "email", "otp": "123456" }
→ same token payload as login
→ 400 invalid_otp
```

### 6.4 OAuth (Google / GitHub — backend-initiated)

> **Outdated approach:** Calling Supabase OAuth directly from the browser is **not** supported. Always start OAuth through the backend endpoints below.

```
GET  /api/v1/users/auth/oauth/
→ [{ provider: "google", name: "Google" }, { provider: "github", ... }]

GET  /api/v1/users/auth/oauth/{provider}/?next=/dashboard
→ { provider, url, state }
```

**Frontend flow:**

1. `GET /api/v1/users/auth/oauth/google/?next=/dashboard` (or `github`)
2. Save `data.state` in `sessionStorage` (e.g. `ryport_oauth_state`)
3. Redirect user to `data.url`
4. After provider callback, backend redirects to `/dashboard?oauth=success&access=...&refresh=...`
5. Save tokens, strip query params, then run bootstrap (§7)

**Fallback** if user lands on `/?code=...` instead:

```
POST /api/v1/users/auth/oauth/callback/
{ "code", "state"?, "totp_token"? }
→ login response (same shape as password login)
```

Build `/auth/callback` (or `/oauth/callback`) as a redirect handler for edge cases; primary success path uses query params on `/dashboard`.

> **Current repo status:** OAuth buttons and `OAuthHandler` are commented out until backend OAuth is verified on Render. Wire-up exists in `lib/api/auth.ts` (`startOAuth`, `completeOAuth`).

### 6.5 Two-factor authentication (settings)

| Action | Method | Path | Body |
|--------|--------|------|------|
| Start setup | POST | `/auth/2fa/enable/` | — |
| Confirm | POST | `/auth/2fa/confirm/` | `{ "token": "123456" }` |
| Disable | POST | `/auth/2fa/disable/` | `{ "token": "123456" }` |
| List backup codes | GET | `/auth/2fa/backup-codes/` | — (masked) |
| Regenerate codes | POST | `/auth/2fa/backup-codes/regenerate/` | `{ "token": "123456" }` |

Enable response includes `qr_code_url`, `provisioning_uri`, `secret` for authenticator apps.

### 6.6 Refresh & logout

```
POST /api/v1/users/auth/refresh/   { "refresh" } → { access, refresh }
POST /api/v1/users/auth/logout/    { "refresh" }   (Bearer required)
```

### 6.7 Profile & plan

```
GET /api/v1/users/me/
→ { id, email, plan, is_2fa_enabled, last_login_ip, created_at }

GET /api/v1/users/me/plan/
→ { plan, display_name, features: [{ name, enabled, limit }] }
```

**Note:** Profile update is not exposed via REST yet — email changes go through Supabase on the backend side.

---

## 7. Bootstrap & global app state

Run on every app load after token validation:

```
1. POST /auth/refresh/          (if access expired)
2. GET  /users/me/              → user profile
3. GET  /users/me/plan/         → feature flags + limits
4. GET  /notifications/unread-count/  → navbar badge
5. GET  /businesses/active/     → Advanced only; null if none
```

### Recommended React context

```typescript
interface AppState {
  user: Profile | null;
  plan: PlanResponse | null;
  unreadNotifications: number;
  activeBusiness: Business | null;
  canUse: (feature: string) => boolean;
  getLimit: (key: string) => number | null;
}
```

### React Query key map

```
['me']
['plan']
['notifications', 'unread-count']
['notifications', { unread, type }]
['transactions', filters]
['transaction', id]
['accounts']
['budgets']
['budget', id, 'usage']
['budget', id, 'alerts']
['reports']
['report', id]
['ai', 'quota']
['ai', 'conversations']
['ai', 'conversation', id]
['ai', 'cash-flow', days]
['ai', 'subscriptions']
['ai', 'budget-recommendations']
['businesses']
['business', 'active']
['business', id, 'analytics']
['business', id, 'members']
['teams', 'invites', businessId]
['api-keys']
```

---

## 8. Subscription plans & gating

### Pricing (marketing — backend enforces via Paystack metadata)

| Plan | Monthly price | Positioning |
|------|---------------|-------------|
| **Free** | ₦0 | AI chat (10/day), 2 banks, 3 budgets |
| **Pro** | ₦5,000/mo | Unlimited AI, cash flow, subscriptions, smart budgets, exports, receipts |
| **Advanced** | ₦15,000/mo | AI CFO, multi-business, teams, API keys, P&L |

Always read live gates from `GET /me/plan/` — do not hardcode.

### Feature matrix

| Feature key | Free | Pro | Advanced |
|-------------|------|-----|----------|
| `ai_chat` | ✅ (10/day) | ✅ | ✅ |
| `cash_flow_prediction` | ❌ | ✅ | ✅ |
| `export_reports` | ❌ | ✅ | ✅ |
| `receipt_scanner` | ❌ | ✅ | ✅ |
| `ai_cfo` | ❌ | ❌ | ✅ |
| `pl_reports` | ❌ | ❌ | ✅ |
| `business_dashboard` | ❌ | ❌ | ✅ |
| `multi_business` | ❌ | ❌ | ✅ |
| `api_access` | ❌ | ❌ | ✅ |
| `team_collaboration` | ❌ | ❌ | ✅ |

### Usage limits (`features` entries with `limit`)

| Limit key | Free | Pro | Advanced |
|-----------|------|-----|----------|
| `ai_messages_per_day` | 10 | ∞ (`null`) | ∞ |
| `bank_accounts` | 2 | 10 | ∞ |
| `budgets` | 3 | ∞ | ∞ |
| `businesses` | 1 | 1 | ∞ |
| `team_members` | 1 | 5 | ∞ |

### UI gating pattern

```tsx
const { canUse, getLimit } = usePlan();

// Hide nav item
if (!canUse('ai_cfo')) return null;

// Show upgrade modal on 403
if (error.code === 'feature_not_available' || error.code === 'plan_limit_exceeded') {
  openUpgradeModal();
}

// AI quota chip (Free)
const quota = await api.get('/ai/chat/quota/');
// Show: quota.remaining / quota.limit
```

---

## 9. Nigerian financial rules

### Currency

- **API storage:** integer **kobo** (`500000` = ₦5,000.00)
- **Display:** `₦` + comma-separated naira
- **Helper:** `formatNaira(kobo) => '₦' + (kobo/100).toLocaleString('en-NG')`

### Transaction categories (DB values for create/update)

```
Food | Transport | Shopping | Utilities | Healthcare |
Entertainment | Business | Education | Uncategorised
```

AI categorisation may return display names like `Food & Dining` — map to DB enum when saving.

### Transaction types

`income` | `expense`

### Nigerian context (for copy & tooltips)

- Salaries typically **25th–28th** of month
- School fees spike **September** and **January**
- Common merchants: Shoprite, Chicken Republic, Bolt, GTBank, Access, Zenith, Kuda, OPay, MTN, EKEDC, Netflix

---

## 10. Complete app sitemap — every page to build

### Public / marketing

| Route | Page | APIs |
|-------|------|------|
| `/` | Landing / marketing | — |
| `/pricing` | Plan comparison | `GET /me/plan/` (if logged in) |
| `/login` | Sign in | `auth/login`, `auth/otp/*`, `auth/oauth/*` |
| `/register` | Sign up | `auth/register` |
| `/auth/callback` | OAuth return handler | `auth/oauth/callback` |
| `/invites/accept` | Team invite landing | `teams/invites/<token>/`, `teams/invites/accept/` |
| `/reset-password` | Password reset form | Triggered by email link (backend sends via `AuthService`) |
| `/verify-email` | Email verification | Future — link from welcome email |

### App shell (authenticated layout)

Shared chrome for all `/app/*` or authenticated routes:

| Component | APIs |
|-----------|------|
| Top nav: logo, search (txn search local), notifications bell | `notifications/unread-count/` |
| Sidebar nav (plan-gated items hidden) | `me/plan/` |
| Business switcher (Advanced) | `businesses/active/`, `businesses/`, `.../switch/` |
| User menu: profile, settings, upgrade, logout | `me/`, `auth/logout/` |
| Upgrade CTA banner (Free/Pro) | `me/plan/` |
| AI quota chip (Free) | `ai/chat/quota/` |

### Core finance

| Route | Page | Min plan | APIs |
|-------|------|----------|------|
| `/dashboard` | Home overview | All | See [§11.1](#111-dashboard-dashboard) |
| `/transactions` | Transaction list + filters | All | `GET /transactions/` |
| `/transactions/new` | Manual entry form | All | `POST /transactions/` |
| `/transactions/:id` | Detail + actions | All | `GET/DELETE /transactions/:id/`, categorise, receipt |
| `/accounts` | Linked banks + Mono Connect | All | `GET/POST/DELETE /accounts/`, `.../sync/` |
| `/budgets` | Budget list + create | All | `GET/POST /budgets/` |
| `/budgets/:id` | Usage + alerts | All | `GET .../usage/`, `.../alerts/`, `.../check-alerts/` |
| `/reports` | Report history + generate | All | `GET/POST /reports/generate/` |
| `/reports/:id` | Report viewer | All | `GET /reports/:id/` |
| `/reports/:id/export` | Download picker | Pro+ | `GET .../export/?export_format=pdf\|csv\|xlsx` |
| `/notifications` | Notification inbox | All | `GET /notifications/`, read endpoints |

### AI hub

| Route | Page | Min plan | APIs |
|-------|------|----------|------|
| `/ai` | AI hub landing (cards to sub-features) | All | `ai/chat/quota/` |
| `/ai/chat` | AI assistant | All | `POST /ai/chat/`, conversations |
| `/ai/cash-flow` | 30-day projection chart | Pro+ | `GET /ai/cash-flow/predict/` |
| `/ai/subscriptions` | Recurring charge detector | Pro+ | `GET /ai/subscriptions/` |
| `/ai/budgets` | Smart budget recommendations | Pro+ | `GET/POST /ai/budget-recommendations/` |
| `/ai/cfo` | AI CFO dashboard | Advanced | `POST /ai/cfo/analyse/` |

### Business & teams (Advanced)

| Route | Page | APIs |
|-------|------|------|
| `/businesses` | Business list + create | `GET/POST /businesses/` |
| `/businesses/:id` | Business overview | `GET /businesses/:id/` |
| `/businesses/:id/analytics` | Revenue/expense analytics | `GET .../analytics/?days=90` |
| `/businesses/:id/team` | Members + pending invites | `GET/POST .../members/`, `teams/.../invites/` |

### Settings

| Route | Page | Min plan | APIs |
|-------|------|----------|------|
| `/settings` | Settings hub | All | — |
| `/settings/profile` | Email, plan badge, member since | All | `GET /me/` |
| `/settings/security` | 2FA setup/disable, backup codes | All | `auth/2fa/*` |
| `/settings/notifications` | Notification preferences | All | *preferences API not yet built — use inbox only* |
| `/settings/api-keys` | Create/list/revoke keys | Advanced | `integrations/api-keys/` |
| `/upgrade` | Plan picker + Paystack checkout | All | Paystack JS + webhook on backend |

### Error / empty states (required pages)

| Route | When |
|-------|------|
| `/403` | Feature not on plan |
| `/404` | Unknown route |
| `/maintenance` | Health check fails |
| `/session-expired` | Refresh token invalid |

---

## 11. Page-by-page UI sections & API wiring

### 11.1 Dashboard `/dashboard`

**Purpose:** At-a-glance financial command center.

| Section | Data source | Notes |
|---------|-------------|-------|
| **Net position card** | Sum `transactions` income − expense (last 30d) | No live bank balance API — derive from txns |
| **Recent transactions** | `GET /transactions/?page_size=5` | Link to `/transactions` |
| **Budget progress** | `GET /budgets/` + each `.../usage/` | Show top 3 by `usage_percent` |
| **AI quick ask** | `POST /ai/chat/` or link to `/ai/chat` | Show quota chip if Free |
| **Notifications preview** | `GET /notifications/?unread=true` (limit 3) | |
| **Cash flow warning** (Pro+) | `GET /ai/cash-flow/predict/?days=30` | Show if `days_until_low` < 14 |
| **Upgrade banner** (Free) | `me/plan/` | |

### 11.2 Transactions `/transactions`

| Section | API |
|---------|-----|
| Filter bar (date, category, type, account) | Query params on `GET /transactions/` |
| Infinite scroll / load more | `data.next` cursor URL |
| Empty state | CTA: link bank or add manual txn |
| Row: merchant, amount, category, date | `Transaction` shape |
| Income green / expense neutral | `type` field |

### 11.3 Transaction detail `/transactions/:id`

| Action | API | Plan |
|--------|-----|------|
| View fields | `GET /transactions/:id/` | All |
| Delete | `DELETE /transactions/:id/` | All |
| Rule categorise | `POST /transactions/:id/categorise/` | All |
| AI categorise | `POST /ai/transactions/:id/categorise/` | All |
| Upload receipt | `POST /transactions/:id/receipt/` multipart | Pro+ |

### 11.4 Accounts `/accounts`

| Section | API |
|---------|-----|
| Account cards (bank logo, masked number) | `GET /accounts/` |
| Link new bank (Mono widget) | Widget → `POST /accounts/ { code }` |
| Sync now | `POST /accounts/:id/sync/` |
| Disconnect | `DELETE /accounts/:id/` |
| Plan limit warning | `me/plan/` → `bank_accounts` limit |

### 11.5 Budgets `/budgets`

| Section | API |
|---------|-----|
| Budget cards with progress ring | `GET /budgets/` + `.../usage/` |
| Create budget modal | `POST /budgets/ { category, limit_kobo, period }` |
| Period toggle | `weekly` \| `monthly` |
| Alert history | `GET /budgets/:id/alerts/` |
| AI badge | `is_ai_recommended: true` |

### 11.6 Reports `/reports`

| Section | API |
|---------|-----|
| Generate monthly | `POST /reports/generate/ { type: "monthly" }` |
| Generate weekly | `{ type: "weekly" }` |
| Generate P&L | `{ type: "pl" }` — **Advanced only** |
| Export buttons | `GET .../export/?export_format=pdf` — **Pro+** |

### 11.7 AI Chat `/ai/chat`

| Section | API |
|---------|-----|
| Sidebar: conversation list | `GET /ai/conversations/` |
| Thread messages | `GET /ai/conversations/:id/` |
| Send message | `POST /ai/chat/ { message, conversation_id? }` |
| Quota header | `GET /ai/chat/quota/` |
| New chat | Omit `conversation_id` |

### 11.8 AI CFO `/ai/cfo` (Advanced)

| Section | Response field |
|---------|----------------|
| Health score gauge | `health_score` (0–100) |
| Executive summary | `executive_summary` |
| Runway card | `runway.months`, `runway.zero_date`, `runway.risk_level` |
| Burn rate | `burn_rate.monthly`, `burn_rate.trend` |
| Risks list | `risks[]` with `severity` badge |
| Cost savings table | `cost_savings[]` |
| Wasteful expenses | `wasteful_expenses[]` |
| Hiring / pricing cards | `hiring_recommendation`, `pricing_recommendation` |
| Cached badge | `cached: true` if < 24h old |

### 11.9 Businesses `/businesses` (Advanced)

| Section | API |
|---------|-----|
| Business cards | `GET /businesses/` |
| Create business | `POST /businesses/ { name, type, currency? }` |
| Types | `retail`, `services`, `manufacturing`, `technology`, `hospitality`, `other` |
| Switch active | `POST /businesses/:id/switch/` |
| Analytics charts | `GET .../analytics/?days=30` |

### 11.10 Team `/businesses/:id/team` (Advanced)

| Action | API |
|--------|-----|
| List members | `GET /businesses/:id/members/` |
| Invite by email | `POST /businesses/:id/members/ { email, role }` |
| Roles | `owner`, `admin`, `viewer`, `accountant` |
| List pending invites | `GET /teams/businesses/:id/invites/` |
| Revoke invite | `DELETE /teams/businesses/:id/invites/:invite_id/` |
| Accept flow (invitee) | `GET /teams/invites/:token/` → `POST /teams/invites/accept/` |

### 11.11 Settings / API keys (Advanced)

| Action | API |
|--------|-----|
| List keys (prefix only) | `GET /integrations/api-keys/` |
| Create key | `POST /integrations/api-keys/ { name }` → **`key` shown once** |
| Revoke | `DELETE /integrations/api-keys/:id/` |

---

## 12. Complete API reference (all endpoints)

Base: `https://ryport.onrender.com/api/v1`

### System (no `/v1` prefix)

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/health/live/` | Public | `{ status: "ok" }` |
| GET | `/api/health/` | Public | `{ status, services: { django, postgres, redis, celery, mono } }` |

### Users `/users/`

| Method | Path | Auth | Body / notes |
|--------|------|------|--------------|
| POST | `auth/register/` | Public | `{ email, password, password_confirm }` → 201 |
| POST | `auth/login/` | Public | `{ email, password, totp_token? }` |
| POST | `auth/logout/` | JWT | `{ refresh }` |
| POST | `auth/refresh/` | Public | `{ refresh }` |
| GET | `auth/oauth/` | Public | Provider list |
| GET | `auth/oauth/<provider>/` | Public | `?redirect_to=` → `{ url, state }` |
| POST | `auth/oauth/callback/` | Public | `{ code, state?, totp_token? }` |
| POST | `auth/otp/request/` | Public | `{ email }` |
| POST | `auth/otp/verify/` | Public | `{ email, otp }` |
| POST | `auth/2fa/enable/` | JWT | — |
| POST | `auth/2fa/confirm/` | JWT | `{ token }` |
| POST | `auth/2fa/disable/` | JWT | `{ token }` |
| GET | `auth/2fa/backup-codes/` | JWT | — |
| POST | `auth/2fa/backup-codes/regenerate/` | JWT | `{ token }` |
| GET | `me/` | JWT | Profile |
| GET | `me/plan/` | JWT | Plan + features |

### Accounts `/accounts/`

| Method | Path | Body / notes |
|--------|------|--------------|
| GET | `/` | List bank accounts |
| POST | `/` | `{ "code": "<mono_link_code>" }` → 201 |
| GET | `/<account_id>/` | Detail |
| DELETE | `/<account_id>/` | → 204 |
| POST | `/<account_id>/sync/` | → `{ synced_count }` |

**BankAccount:**
```json
{
  "id": "uuid",
  "bank_name": "GTBank",
  "account_name": "John Doe",
  "masked_account_number": "****1234",
  "mono_account_id": "...",
  "is_active": true,
  "connected_at": "2026-06-29T..."
}
```

### Transactions `/transactions/`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | Cursor pagination + filters |
| POST | `/` | Requires `idempotency_key` |
| GET | `/<id>/` | Detail |
| DELETE | `/<id>/` | Soft delete → 204 |
| POST | `/<id>/categorise/` | Rule engine (non-AI) |
| POST | `/<id>/receipt/` | Pro+, multipart `receipt` |

**Create body:**
```json
{
  "amount_kobo": 500000,
  "type": "expense",
  "category": "Food",
  "description": "Lunch",
  "merchant": "Chicken Republic",
  "account_id": "uuid-or-null",
  "transaction_date": "2026-06-29T12:00:00Z",
  "idempotency_key": "client-unique-per-submit"
}
```

### Budgets `/budgets/`

| Method | Path | Body |
|--------|------|------|
| GET | `/` | — |
| POST | `/` | `{ category, limit_kobo, period: "weekly"\|"monthly" }` |
| GET | `/<id>/` | — |
| PATCH | `/<id>/` | Partial update |
| DELETE | `/<id>/` | Deactivate |
| GET | `/<id>/usage/` | `{ spent_kobo, limit_kobo, usage_percent, is_over_budget, ... }` |
| GET | `/<id>/alerts/` | Sent threshold alerts |
| POST | `/<id>/check-alerts/` | Trigger manual check |

### Reports `/reports/`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | List |
| POST | `/generate/` | `{ type: "monthly"\|"weekly"\|"pl", period? }` — `pl` = Advanced |
| GET | `/<id>/` | Full JSON report |
| GET | `/<id>/export/` | Pro+, `?export_format=pdf\|csv\|xlsx` — raw file |

### Notifications `/notifications/`

| Method | Path | Query |
|--------|------|-------|
| GET | `/` | `?unread=true`, `?type=budget_alert` |
| GET | `/unread-count/` | → `{ count }` |
| POST | `/read-all/` | — |
| GET | `/<id>/` | Detail |
| POST | `/<id>/read/` | Mark one read |

**Types:** `budget_alert`, `bill_reminder`, `weekly_summary`, `cash_flow_warning`

### AI `/ai/`

| Method | Path | Plan | Body / query |
|--------|------|------|--------------|
| POST | `chat/` | All | `{ message, conversation_id? }` |
| GET | `chat/quota/` | All | — |
| GET | `conversations/` | All | — |
| GET | `conversations/<id>/` | All | — |
| POST | `cfo/analyse/` | Advanced | `{ business_id? }` |
| GET | `cash-flow/predict/` | Pro+ | `?days=30` |
| POST | `transactions/<id>/categorise/` | All | — |
| GET | `subscriptions/` | Pro+ | `?refresh=true` optional |
| GET | `budget-recommendations/` | Pro+ | — |
| POST | `budget-recommendations/apply/` | Pro+ | — (applies all recommendations) |

### Businesses `/businesses/` (Advanced)

| Method | Path | Body |
|--------|------|------|
| GET | `/` | — |
| POST | `/` | `{ name, type, currency?: "NGN" }` |
| GET | `/active/` | Current active business or `null` |
| GET | `/<id>/` | — |
| POST | `/<id>/switch/` | Set active business |
| GET | `/<id>/analytics/` | `?days=90` |
| GET | `/<id>/members/` | Team members |
| POST | `/<id>/members/` | `{ email, role }` → sends invite |

### Teams `/teams/`

| Method | Path | Body |
|--------|------|------|
| GET | `invites/<token>/` | Public preview (JWT optional) |
| POST | `invites/accept/` | `{ token }` |
| GET | `businesses/<id>/invites/` | Pending invites |
| DELETE | `businesses/<id>/invites/<invite_id>/` | Revoke |

### Integrations `/integrations/`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `api-keys/` | JWT Advanced | List keys |
| POST | `api-keys/` | JWT Advanced | `{ name }` → includes raw `key` once |
| DELETE | `api-keys/<id>/` | JWT Advanced | Revoke |
| GET | `external/me/` | `Authorization: ApiKey <key>` | External API identity |
| POST | `webhooks/paystack/` | Paystack signature | Server only |
| POST | `webhooks/mono/` | Mono secret | Server only |

---

## 13. AI features (detailed)

### Chat response

```json
{
  "response": "You spent ₦45,000 on food...",
  "reply": "...",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "remaining_quota": 7
}
```

### Quota response

```json
{
  "used": 3,
  "limit": 10,
  "remaining": 7,
  "resets_at": "2026-07-02T00:00:00Z",
  "is_unlimited": false
}
```

### Cash flow (Pro+)

Key fields: `current_balance`, `projections[]`, `days_until_low`, `low_balance_date`, `ai_insight`, `burn_rate_daily`, `burn_rate_monthly`

### Subscriptions (Pro+)

Each item: `merchant`, `amount_monthly_kobo`, `amount_monthly_naira`, `frequency`, `last_charged`, `is_duplicate`

### Smart budgets (Pro+)

Recommendation: `category`, `db_category`, `avg_spend`, `recommended_limit`, `reasoning`, `confidence`  
Apply: `POST .../apply/` → array of created budgets

### AI CFO (Advanced)

See §11.8. Response may include `cached: true`. Backend runs weekly Celery job for Advanced users.

**Important:** AI never receives financial numbers from the frontend — it reads the database via `FinancialContextBuilder`. Send only `message` and optional `conversation_id`.

---

## 14. Mono bank linking

1. Load [Mono Connect widget](https://docs.mono.co/docs/widget/overview) on `/accounts`
2. User completes bank auth → widget returns `code`
3. `POST /api/v1/accounts/ { "code": "<code>" }`
4. Refresh `GET /accounts/`
5. Optional: `POST /accounts/:id/sync/` for immediate transaction pull
6. Webhooks also sync in background (`/api/v1/integrations/webhooks/mono/`)

**Plan limit:** Check `bank_accounts` limit before showing "Link bank" CTA.

---

## 15. Paystack upgrade / billing

The backend does **not** expose a checkout API. Frontend integrates Paystack directly:

1. User picks plan on `/upgrade`
2. Initialize Paystack with **metadata**:
   ```json
   {
     "user_id": "<uuid from /me/>",
     "plan": "pro" | "advanced",
     "email": "user@example.com"
   }
   ```
3. On success, Paystack webhook hits `POST /api/v1/integrations/webhooks/paystack/`
4. Backend updates `user.plan` and sends confirmation email
5. Frontend polls `GET /me/plan/` or listens for redirect success URL

**Prices:** Pro ₦5,000/mo, Advanced ₦15,000/mo (charge amounts configured in Paystack dashboard).

---

## 16. Notifications & email deep links

Backend emails use `FRONTEND_URL`. Implement these routes:

| Email | Frontend path |
|-------|---------------|
| Welcome | `/dashboard` |
| OTP login | `/login` |
| Team invite | `/invites/accept?token=<token>` |
| Password reset | `/reset-password?email=...` |
| Plan upgrade/downgrade | `/upgrade` or `/settings/profile` |
| Payment success/fail | `/upgrade` |
| Budget alert | `/budgets/<id>` |
| Bill reminder | `/notifications` (bills UI TBD) |
| Weekly summary | `/reports` |
| Cash flow warning | `/ai/cash-flow` |
| API key created/revoked | `/settings/api-keys` |
| Suspicious login | `/settings/security` |

---

## 17. Background jobs that affect UX

| Schedule | What happens | Frontend impact |
|----------|--------------|-----------------|
| Hourly | Budget alert checks | New `budget_alert` notifications |
| Daily 09:00 | Bill reminders | `bill_reminder` notifications |
| Monday 08:00 | Weekly reports + email | New `weekly_summary` notifications |
| 1st of month 06:00 | Monthly reports | New reports in `/reports` |
| Sunday 00:00 | AI CFO for Advanced users | CFO data may update |
| Every 5 min | Admin stats cache | Ops only |

Poll `notifications/unread-count/` on focus / interval (e.g. 60s).

---

## 18. Error handling

| HTTP | `error.code` | Frontend action |
|------|--------------|-----------------|
| 400 | `validation_error` | Field errors from `details` |
| 400 | `invalid_otp` | OTP form error |
| 401 | `invalid_credentials` | Login error |
| 401 | `not_authenticated` | Refresh or redirect `/login` |
| 403 | `two_factor_required` | TOTP modal |
| 403 | `feature_not_available` | Upgrade modal |
| 403 | `plan_limit_exceeded` | Upgrade modal with limit |
| 404 | `*_not_found` | 404 state |
| 409 | `email_already_exists` | Register form |
| 429 | `quota_exceeded` | AI upgrade prompt |
| 500 | `internal_error` | Toast + `request_id` for support |

---

## 19. Suggested frontend architecture

### API client

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
      ...options?.headers,
    },
  });
  if (res.status === 204) return null as T;
  const json = await res.json();
  if (!json.success) throw new ApiError(json.error, res.status, json.request_id);
  return json.data as T;
}
```

### Route protection

```
Public routes: /, /login, /register, /auth/callback, /invites/accept
Auth routes: everything else → redirect /login if no valid token
Plan routes: check canUse() before render; still handle 403 from API
```

### Design tokens (match Ryport brand)

- Primary: `#1E40AF`
- Background: `#FFFFFF` / `#F8FAFC`
- Font: Inter
- Radius: 8–12px
- See `docs/design-tokens.md` in backend repo

---

## 20. TypeScript types

```typescript
type Plan = 'free' | 'pro' | 'advanced';
type TransactionType = 'income' | 'expense';
type TransactionCategory =
  | 'Food' | 'Transport' | 'Shopping' | 'Utilities'
  | 'Healthcare' | 'Entertainment' | 'Business'
  | 'Education' | 'Uncategorised';

interface Profile {
  id: string;
  email: string;
  plan: Plan;
  is_2fa_enabled: boolean;
  last_login_ip: string | null;
  created_at: string;
}

interface PlanFeature {
  name: string;
  enabled: boolean;
  limit: number | null;
}

interface Transaction {
  id: string;
  account_id: string | null;
  amount_kobo: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  merchant: string;
  is_manual: boolean;
  transaction_date: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface BudgetUsage {
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
}

interface ChatResponse {
  response: string;
  reply: string;
  conversation_id: string;
  message_id: string;
  remaining_quota: number | null;
}

interface AIQuota {
  used: number;
  limit: number;
  remaining: number;
  resets_at: string;
  is_unlimited: boolean;
}

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}
```

---

## 21. Gaps & backend-only features

Features that exist in backend but **have no customer REST API yet** — do not build UI expecting these endpoints:

| Feature | Status | Workaround |
|---------|--------|------------|
| **Bills CRUD** | Model + Celery reminders only | Show bill reminders via notifications inbox; full bills page blocked until API added |
| **Profile update** | Read-only `/me/` | — |
| **Password reset trigger** | Backend email service only | Link from email to `/reset-password` |
| **Real-time txn push** | Supabase broadcast (optional) | Poll transactions or use SWR refresh on focus |
| **Admin ops dashboard** | `/ryport-ops/` Django templates | Separate product — not part of customer app |

If you need any of these for MVP, coordinate with backend to add endpoints first.

---

## 22. Related docs

| Doc | Path |
|-----|------|
| Backend README | `README.md` |
| Render deploy / ALLOWED_HOSTS | `docs/render-deploy.md` |
| Architecture | `docs/architecture/README.md` |
| Security | `docs/security/README.md` |
| Design tokens | `docs/design-tokens.md` |

---

## Quick checklist for frontend lead

- [ ] Set `NEXT_PUBLIC_API_URL=https://ryport.onrender.com`
- [ ] Confirm Render `ALLOWED_HOSTS` includes `ryport.onrender.com`
- [ ] Confirm `CORS_ALLOWED_ORIGINS` includes your frontend origin
- [ ] Implement auth (password + OTP + 2FA; OAuth via backend `GET /users/auth/oauth/{provider}/` when UI re-enabled)
- [ ] Bootstrap: `me`, `plan`, `unread-count`, `active business`
- [ ] Build all routes in [§10](#10-complete-app-sitemap--every-page-to-build)
- [ ] Gate features via `me/plan/` — never hardcode
- [ ] All money in kobo; display as ₦
- [ ] Manual txn: generate unique `idempotency_key` per submit
- [ ] Mono widget → `POST /accounts/`
- [ ] Paystack checkout with `user_id` + `plan` metadata
- [ ] Handle 403/429 with upgrade flows
- [ ] Do **not** rebuild `/ryport-ops/` in React

---

*Questions → backend team with `request_id` from error responses.*