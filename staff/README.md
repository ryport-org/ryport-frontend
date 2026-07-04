# Ryport Staff Dashboard

Internal operations dashboard for Ryport staff at **https://staff.ryport.com.ng**.

This is a **separate Next.js app** from the customer frontend. It uses the Staff REST API (`/staff/api/v1/`) with its own JWT auth — not customer tokens.

## Quick start

```bash
cd staff
cp .env.example .env.local
npm install
npm run dev
```

Opens at **http://localhost:3001** (CORS allowlisted on the backend).

## Environment

```env
NEXT_PUBLIC_STAFF_API_URL=https://ryport.onrender.com
NEXT_PUBLIC_STAFF_APP_URL=https://staff.ryport.com.ng
```

## Docs

Full API reference: [`../docs/staff-api-integration.md`](../docs/staff-api-integration.md)

## What's implemented

| Area | Status |
|------|--------|
| Staff login | ✅ |
| Accept invite | ✅ |
| Token refresh on 401 | ✅ |
| Dashboard overview (`GET /dashboard/overview/`) | ✅ |
| Permission-gated nav | ✅ |
| Settings (department) | ✅ |
| Users, revenue, analytics, support, etc. | Scaffolded — wire endpoints per doc |

## Design

Near-white system, indigo accent (`#5E6AD2`), 6px radius — internal tool aesthetic per project design tokens.

## Deploy

Host this app at `staff.ryport.com.ng`. Set env vars in your hosting provider. Ensure backend `STAFF_CORS_ALLOWED_ORIGINS` includes the production URL.
