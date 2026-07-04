# Ryport Frontend

Marketing site and authenticated dashboard for [Ryport](https://www.ryport.com.ng) — AI-powered financial operating system for Nigeria.

## Developer docs

| Doc | Purpose |
|-----|---------|
| [`docs/frontend-dev-handoff.md`](docs/frontend-dev-handoff.md) | **Start here** — auth, bootstrap, plan gates, money rules |
| [`docs/frontend-integration.md`](docs/frontend-integration.md) | Full API reference, sitemap, page wiring |
| [`docs/staff-api-integration.md`](docs/staff-api-integration.md) | Staff dashboard API (`staff.ryport.com.ng`) |
| [`staff/README.md`](staff/README.md) | Staff Next.js app — run on port 3001 |

## Setup

```bash
npm install
cp .env.example .env.local
```

Required env:

```env
NEXT_PUBLIC_API_URL=https://ryport.onrender.com
NEXT_PUBLIC_APP_URL=https://www.ryport.com.ng
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth (implemented)

- **Login / register:** `POST /api/v1/users/auth/login/` and `/register/`
- **Tokens:** `access_token` + `refresh_token` in `localStorage`
- **API calls:** `Authorization: Bearer <access>` on every protected request (`lib/api/client.ts`)
- **Bootstrap after login:** `/users/me/`, `/users/me/plan/`, `/businesses/active/`, `/notifications/unread-count/`, `/ai/chat/quota/`
- **OAuth:** Backend-initiated flow is wired but **UI temporarily disabled** — see commented code in `components/auth/social-logins.tsx`

## App routes

- `/` — Marketing site
- `/login`, `/register` — Email/password auth
- `/app/dashboard` — Authenticated app (use `/app/*` not `/dashboard` for the product UI)

## Do NOT rebuild in customer app

- `/ryport-ops/` — legacy Django ops (replaced by [`staff/`](staff/README.md))
- `/admin/` — Django admin

## Staff dashboard

Separate app in [`staff/`](staff/). Deploy to `staff.ryport.com.ng`:

```bash
cd staff && npm install && npm run dev
```

## Deploy

Deploy to Vercel. Set environment variables from `.env.example`.
