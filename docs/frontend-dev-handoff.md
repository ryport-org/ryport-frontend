# Frontend developer handoff — Ryport customer app

**Audience:** Frontend engineer building the React/Next.js app at `https://www.ryport.com.ng`  
**Backend API:** `https://ryport.onrender.com/api/v1/`  
**Full reference:** [`docs/frontend-integration.md`](./frontend-integration.md)

---

## 1. Environment

```env
NEXT_PUBLIC_API_URL=https://ryport.onrender.com
NEXT_PUBLIC_APP_URL=https://www.ryport.com.ng
```

All API calls: `${NEXT_PUBLIC_API_URL}/api/v1/...`

CORS is already configured for `ryport.com.ng` and `www.ryport.com.ng`.

---

## 2. Authentication (critical — must implement correctly)

Auth is **Supabase-backed**. The backend issues tokens; the frontend must store and send them.

### Email/password login

```http
POST /api/v1/users/auth/login/
Content-Type: application/json

{ "email": "...", "password": "..." }
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "...",
    "plan": "free|pro|advanced",
    "is_2fa_enabled": false,
    "access": "<supabase-access-token>",
    "refresh": "<supabase-refresh-token>"
  }
}
```

Save tokens to `localStorage` as `access_token` and `refresh_token` (implemented in `lib/auth/tokens.ts`).

### Register

```http
POST /api/v1/users/auth/register/
{ "email", "password", "password_confirm" }
```

### Every authenticated request

```http
Authorization: Bearer <access>
```

Without this header, `/users/me/`, `/ai/chat/`, transactions, etc. return **401/403**.

Implemented in `lib/api/client.ts` — all protected calls attach the Bearer token automatically.

### Token refresh

```http
POST /api/v1/users/auth/refresh/
{ "refresh": "<refresh-token>" }
```

### OAuth (Google / GitHub)

**Do not** call Supabase OAuth directly from the browser.

1. `GET /api/v1/users/auth/oauth/google/?next=/dashboard`
2. Save `data.state` in `sessionStorage` (`ryport_oauth_state`)
3. Redirect user to `data.url`
4. After callback, user lands on `/dashboard?oauth=success&access=...&refresh=...`
5. Save tokens, strip query params, then bootstrap

Fallback if user lands on `/?code=...`:

```http
POST /api/v1/users/auth/oauth/callback/
{ "code", "state" }
```

> **Note:** OAuth UI is temporarily commented out in this repo (see `components/auth/social-logins.tsx`, `components/auth/oauth-handler.tsx`). Re-enable when backend OAuth is live on Render.

### Session sync (optional)

After client-side token save:

```http
POST /api/v1/users/auth/session/sync/
Authorization: Bearer <access>
{ "refresh": "..." }
```

---

## 3. App bootstrap (after login)

On app load with a stored access token (`lib/auth/auth-context.tsx` → `bootstrap()`):

| Order | Endpoint | Purpose |
|-------|----------|---------|
| 1 | `GET /users/me/` | Profile |
| 2 | `GET /users/me/plan/` | Plan + feature gates |
| 3 | `GET /businesses/active/` | Active business (`null` for free users) |
| 4 | `GET /notifications/unread-count/` | Badge |
| 5 | `GET /ai/chat/quota/` | Free plan AI limit chip |

---

## 4. Plan gating (show/hide UI)

| Feature | Minimum plan |
|---------|----------------|
| AI chat | Free (10 msgs/day) |
| Cash flow, subscriptions, smart budgets | Pro |
| AI CFO, P&L, multi-business, API keys | Advanced |

Use `useAuth().canUse('feature_key')` — gates come from `GET /users/me/plan/`.  
403 responses include `error.code` — use for upgrade prompts.

---

## 5. Money rules

- All amounts are **kobo integers** (₦1 = 100 kobo)
- Display: `formatNaira(kobo)` in `lib/format.ts`
- Manual transaction create **requires** unique `idempotency_key` per submit (`crypto.randomUUID()`)

---

## 6. Key pages & APIs

| Page | Route | Endpoints |
|------|-------|-----------|
| Dashboard | `/app/dashboard` | transactions, budgets, notifications, AI quota |
| Transactions | `/app/transactions` | `GET/POST /transactions/` |
| Budgets | `/app/budgets` | `GET/POST /budgets/` |
| Reports | `/app/reports` | `POST /reports/generate/` |
| AI chat | `/app/ai/chat` | `POST /ai/chat/` |
| Bank link | `/app/accounts` | Mono widget + `POST /accounts/` |
| Billing | `/app/upgrade` | Paystack |
| Settings | `/app/settings/*` | profile, 2FA, logout |

---

## 7. Error handling

Standard error shape:

```json
{
  "success": false,
  "error": { "code": "invalid_credentials", "message": "..." }
}
```

Common codes: `invalid_credentials`, `email_not_confirmed`, `oauth_account_required`, `quota_exceeded`, `feature_not_available`, `plan_limit_exceeded`.

---

## 8. Do NOT build in React

| URL | Reason |
|-----|--------|
| `/ryport-ops/` | Internal ops dashboard (Django) |
| `/admin/` | Django admin |

---

## 9. Health checks

```bash
curl https://ryport.onrender.com/api/health/live/
curl https://ryport.onrender.com/api/health/
```

---

## 10. Test account (dev seed only)

After `python manage.py seed_dev`:

| Email | Password | Plan |
|-------|----------|------|
| free@ryport.dev | dev-pass-change-me | free |
| pro@ryport.dev | dev-pass-change-me | pro |
| advanced@ryport.dev | dev-pass-change-me | advanced |

---

## Quick console test (production)

After sign-in on https://www.ryport.com.ng:

```js
const token = localStorage.getItem('access_token')
console.log('token present?', !!token)
fetch('https://ryport.onrender.com/api/v1/users/me/', {
  headers: { Authorization: `Bearer ${token}` },
}).then(r => r.json()).then(console.log)
```

- `token present? false` → tokens not saved; check OAuth handler / login flow  
- `401` → invalid token; check backend `SUPABASE_JWT_SECRET` on Render  
- `200` → auth works

---

## Code map (this repo)

| Concern | Location |
|---------|----------|
| API client + Bearer | `lib/api/client.ts` |
| Token storage | `lib/auth/tokens.ts` |
| Login / register / bootstrap | `lib/auth/auth-context.tsx` |
| OAuth handler (disabled) | `components/auth/oauth-handler.tsx` |
| Plan gates | `useAuth().canUse()` |
| Money formatting | `lib/format.ts` |
| Idempotency on txn create | `app/app/transactions/page.tsx` |
