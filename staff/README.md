# Staff dashboard (integrated)

The staff dashboard lives in the **main app** at `/staff`, not a separate subdomain.

| Page | Route |
|------|-------|
| Login | `/staff/login` |
| Accept invite | `/staff/accept-invite` |
| Dashboard | `/staff` |
| Users | `/staff/users` |

Source: `app/staff/`, `components/staff/`, `lib/staff/`

API: `POST /staff/api/v1/auth/login/` — see [`../docs/staff-api-integration.md`](../docs/staff-api-integration.md)

The standalone Next.js app in this folder is **deprecated** — use the integrated routes above.
