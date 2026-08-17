<div align="center">
  <img src="public/logo.png" alt="Ryport Logo" width="160" />
  <h1>Ryport Frontend</h1>
  <p><b>AI-Powered Financial Operating System for Nigeria</b></p>
  <p>Track spending, manage budgets, automate cash flow, and access executive AI CFO insights with kobo precision.</p>
</div>

---

## 📌 Overview

**Ryport** is an AI-powered financial operating system built specifically for the Nigerian market. It connects Nigerian bank accounts (via Open Banking / Mono integration), tracks every transaction with zero rounding loss (stored in kobo integers), provides smart budget tracking, and delivers an executive AI CFO assistant for individuals, freelancers, agencies, and small-to-medium enterprises (SMEs).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router with Turbopack)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **State & Auth**: Supabase SSR (`@supabase/supabase-js`, `@supabase/ssr`) + Dual Custom Auth Contexts (User JWT + Staff JWT)
- **Monitoring & Analytics**: [Sentry (`@sentry/nextjs`)](https://sentry.io/)
- **Testing**: [Vitest](https://vitest.dev/) with JSDOM
- **TypeScript**: Strict Type Safety (`^5.0`)

---

## 🎨 Branding & Favicon Setup

The project uses the official Ryport logo ([`public/logo.png`](public/logo.png)) across marketing, dashboard UI, and metadata. Responsive favicons and web icons are generated directly from the primary logo:

- **Primary Logo**: [`public/logo.png`](public/logo.png)
- **Favicon (Multi-resolution ICO)**: [`public/favicon.ico`](public/favicon.ico), [`app/favicon.ico`](app/favicon.ico)
- **Standard PNG Icons**: [`public/icon.png`](public/icon.png), [`app/icon.png`](app/icon.png) (32x32)
- **High-Res Web Icon**: [`public/icon-512.png`](public/icon-512.png) (512x512)
- **Apple Touch Icon**: [`public/apple-icon.png`](public/apple-icon.png), [`app/apple-icon.png`](app/apple-icon.png) (180x180)
- **Web App Manifest**: [`app/manifest.ts`](app/manifest.ts)

---

## 🗺️ Project Page Directory

Ryport consists of 6 primary page categories spanning 60+ routes:

### 1. Marketing & Public Pages (`(marketing)`)
Designed for product discovery, SEO landing, pricing evaluation, and regulatory policies.

| Route | Page File | Description |
|-------|-----------|-------------|
| `/` | [`app/(marketing)/page.tsx`](app/(marketing)/page.tsx) | Homepage & Hero section with product preview and CTAs |
| `/about` | [`app/(marketing)/about/page.tsx`](app/(marketing)/about/page.tsx) | About Ryport, mission, vision, and team story |
| `/features` | [`app/(marketing)/features/page.tsx`](app/(marketing)/features/page.tsx) | Comprehensive product features breakdown |
| `/pricing` | [`app/(marketing)/pricing/page.tsx`](app/(marketing)/pricing/page.tsx) | Interactive plan comparison & billing tiers |
| `/why-ryport` | [`app/(marketing)/why-ryport/page.tsx`](app/(marketing)/why-ryport/page.tsx) | Value proposition vs traditional accounting tools |
| `/ai-insights` | [`app/(marketing)/ai-insights/page.tsx`](app/(marketing)/ai-insights/page.tsx) | AI Financial Engine showcase & smart CFO overview |
| `/integrations` | [`app/(marketing)/integrations/page.tsx`](app/(marketing)/integrations/page.tsx) | Mono & open banking bank integration showcase |
| `/security` | [`app/(marketing)/security/page.tsx`](app/(marketing)/security/page.tsx) | Bank-level security, encryption, and compliance standards |
| `/customers` | [`app/(marketing)/customers/page.tsx`](app/(marketing)/customers/page.tsx) | Customer success stories, reviews, and testimonials |
| `/contact` | [`app/(marketing)/contact/page.tsx`](app/(marketing)/contact/page.tsx) | Contact form, sales inquiries, and support helpdesk |
| `/blog` | [`app/(marketing)/blog/page.tsx`](app/(marketing)/blog/page.tsx) | Financial tips, SME guides, and product announcements |
| `/dashboard` | [`app/(marketing)/dashboard/page.tsx`](app/(marketing)/dashboard/page.tsx) | Marketing preview of the dashboard interface |
| `/solutions/small-business` | [`app/(marketing)/solutions/small-business/page.tsx`](app/(marketing)/solutions/small-business/page.tsx) | Solutions tailored for Small & Medium Enterprises (SMEs) |
| `/solutions/freelancers` | [`app/(marketing)/solutions/freelancers/page.tsx`](app/(marketing)/solutions/freelancers/page.tsx) | Solutions tailored for freelancers & solo creators |
| `/solutions/agencies` | [`app/(marketing)/solutions/agencies/page.tsx`](app/(marketing)/solutions/agencies/page.tsx) | Solutions tailored for digital & creative agencies |
| `/privacy` | [`app/(marketing)/privacy/page.tsx`](app/(marketing)/privacy/page.tsx) | Privacy Policy documentation |
| `/terms` | [`app/(marketing)/terms/page.tsx`](app/(marketing)/terms/page.tsx) | Terms of Service documentation |
| `/cookies` | [`app/(marketing)/cookies/page.tsx`](app/(marketing)/cookies/page.tsx) | Cookie Usage Policy documentation |

---

### 2. Authentication & Onboarding Pages (`(auth)`)
Secure entry points, multi-step customer onboarding, invite processing, and password resets.

| Route | Page File | Description |
|-------|-----------|-------------|
| `/login` | [`app/(auth)/login/page.tsx`](app/(auth)/login/page.tsx) | User login form (JWT authentication) |
| `/register` | [`app/(auth)/register/page.tsx`](app/(auth)/register/page.tsx) | New user registration flow |
| `/reset-password` | [`app/(auth)/reset-password/page.tsx`](app/(auth)/reset-password/page.tsx) | Account password recovery & reset |
| `/onboarding/segment` | [`app/(auth)/onboarding/segment/page.tsx`](app/(auth)/onboarding/segment/page.tsx) | User segmentation onboarding (Personal vs Business profile) |
| `/onboarding/business` | [`app/(auth)/onboarding/business/page.tsx`](app/(auth)/onboarding/business/page.tsx) | Business workspace creation & setup step |
| `/invites/accept` | [`app/(auth)/invites/accept/page.tsx`](app/(auth)/invites/accept/page.tsx) | Accept business team invitation link |
| `/oauth/callback` | [`app/(auth)/oauth/callback/page.tsx`](app/(auth)/oauth/callback/page.tsx) | OAuth third-party auth callback handler |
| `/auth/callback` | [`app/(auth)/auth/callback/page.tsx`](app/(auth)/auth/callback/page.tsx) | Supabase/JWT authentication callback router |

---

### 3. Authenticated App Pages (`/app/*`)
The core customer workspace for tracking finances, accounts, budgets, and businesses.

| Route | Page File | Description |
|-------|-----------|-------------|
| `/app` | [`app/app/page.tsx`](app/app/page.tsx) | Root application entry (redirects to dashboard) |
| `/app/dashboard` | [`app/app/dashboard/page.tsx`](app/app/dashboard/page.tsx) | Main customer dashboard (Balances, quick stats, AI insights) |
| `/app/accounts` | [`app/app/accounts/page.tsx`](app/app/accounts/page.tsx) | Connected bank accounts (Mono sync & manual accounts) |
| `/app/transactions` | [`app/app/transactions/page.tsx`](app/app/transactions/page.tsx) | Full transaction list with search, filter, & categories |
| `/app/transactions/new` | [`app/app/transactions/new/page.tsx`](app/app/transactions/new/page.tsx) | Log manual transaction in Kobo precision |
| `/app/transactions/[id]` | [`app/app/transactions/[id]/page.tsx`](app/app/transactions/[id]/page.tsx) | Detailed view of a single transaction |
| `/app/budgets` | [`app/app/budgets/page.tsx`](app/app/budgets/page.tsx) | Budget categories overview & spending limits |
| `/app/budgets/[id]` | [`app/app/budgets/[id]/page.tsx`](app/app/budgets/[id]/page.tsx) | Detailed breakdown of a specific budget |
| `/app/reports` | [`app/app/reports/page.tsx`](app/app/reports/page.tsx) | Financial reports list (P&L, Cashflow, Monthly summary) |
| `/app/reports/[id]` | [`app/app/reports/[id]/page.tsx`](app/app/reports/[id]/page.tsx) | Generated financial report viewer & export |
| `/app/notifications` | [`app/app/notifications/page.tsx`](app/app/notifications/page.tsx) | Notification center & unread alerts |
| `/app/upgrade` | [`app/app/upgrade/page.tsx`](app/app/upgrade/page.tsx) | Plan upgrade & subscription tier management |
| `/app/businesses` | [`app/app/businesses/page.tsx`](app/app/businesses/page.tsx) | Business directory & active workspace switcher |
| `/app/businesses/[id]` | [`app/app/businesses/[id]/page.tsx`](app/app/businesses/[id]/page.tsx) | Specific business workspace details |
| `/app/businesses/[id]/analytics` | [`app/app/businesses/[id]/analytics/page.tsx`](app/app/businesses/[id]/analytics/page.tsx) | Business financial analytics & revenue tracking |
| `/app/businesses/[id]/team` | [`app/app/businesses/[id]/team/page.tsx`](app/app/businesses/[id]/team/page.tsx) | Team members, invitations, & role permissions |
| `/app/settings` | [`app/app/settings/page.tsx`](app/app/settings/page.tsx) | User settings navigation & account settings hub |
| `/app/settings/profile` | [`app/app/settings/profile/page.tsx`](app/app/settings/profile/page.tsx) | Profile details, display name, and avatar settings |
| `/app/settings/security` | [`app/app/settings/security/page.tsx`](app/app/settings/security/page.tsx) | Password change, 2FA, & session management |
| `/app/settings/api-keys` | [`app/app/settings/api-keys/page.tsx`](app/app/settings/api-keys/page.tsx) | Developer API key generation & access management |

---

### 4. AI Financial Hub (`/app/ai/*`)
AI-powered features and insights for personal & SME financial management.

| Route | Page File | Description |
|-------|-----------|-------------|
| `/app/ai` | [`app/app/ai/page.tsx`](app/app/ai/page.tsx) | AI Financial Hub landing & feature directory |
| `/app/ai/chat` | [`app/app/ai/chat/page.tsx`](app/app/ai/chat/page.tsx) | Conversational AI CFO chat assistant |
| `/app/ai/cfo` | [`app/app/ai/cfo/page.tsx`](app/app/ai/cfo/page.tsx) | Executive AI financial summary & action items |
| `/app/ai/budgets` | [`app/app/ai/budgets/page.tsx`](app/app/ai/budgets/page.tsx) | AI smart budget recommendations |
| `/app/ai/cash-flow` | [`app/app/ai/cash-flow/page.tsx`](app/app/ai/cash-flow/page.tsx) | Liquidity forecasting & cash flow projections |
| `/app/ai/subscriptions` | [`app/app/ai/subscriptions/page.tsx`](app/app/ai/subscriptions/page.tsx) | Automated recurring subscription detector |

---

### 5. Staff Administration Portal (`/staff/*`)
Internal admin suite for Ryport operations team, support staff, and platform monitoring.

| Route | Page File | Description |
|-------|-----------|-------------|
| `/staff/login` | [`app/staff/login/page.tsx`](app/staff/login/page.tsx) | Staff portal authentication |
| `/staff` | [`app/staff/(shell)/page.tsx`](app/staff/(shell)/page.tsx) | Platform dashboard & global system overview |
| `/staff/users` | [`app/staff/(shell)/users/page.tsx`](app/staff/(shell)/users/page.tsx) | Platform user directory, search, & account actions |
| `/staff/users/[id]` | [`app/staff/(shell)/users/[id]/page.tsx`](app/staff/(shell)/users/[id]/page.tsx) | Detailed user account inspection & audit view |
| `/staff/analytics` | [`app/staff/(shell)/analytics/page.tsx`](app/staff/(shell)/analytics/page.tsx) | System usage, active users, & feature telemetry |
| `/staff/revenue` | [`app/staff/(shell)/revenue/page.tsx`](app/staff/(shell)/revenue/page.tsx) | Platform subscription revenue & billing metrics |
| `/staff/support` | [`app/staff/(shell)/support/page.tsx`](app/staff/(shell)/support/page.tsx) | Customer support desk & ticket resolution |
| `/staff/team` | [`app/staff/(shell)/team/page.tsx`](app/staff/(shell)/team/page.tsx) | Internal staff team list & permission roles |
| `/staff/system` | [`app/staff/(shell)/system/page.tsx`](app/staff/(shell)/system/page.tsx) | Server health, API service status, & webhooks status |
| `/staff/audit` | [`app/staff/(shell)/audit/page.tsx`](app/staff/(shell)/audit/page.tsx) | Comprehensive security & system action audit logs |
| `/staff/announcements` | [`app/staff/(shell)/announcements/page.tsx`](app/staff/(shell)/announcements/page.tsx) | Global in-app announcements manager |
| `/staff/accept-invite` | [`app/staff/accept-invite/page.tsx`](app/staff/accept-invite/page.tsx) | Accept staff workspace invitation |

---

### 6. System & Exception Utility Pages
Handled routes for status codes, error boundaries, and system states.

| Route | Page File | Description |
|-------|-----------|-------------|
| `/403` | [`app/403/page.tsx`](app/403/page.tsx) | 403 Access Denied error page |
| `/maintenance` | [`app/maintenance/page.tsx`](app/maintenance/page.tsx) | Scheduled maintenance announcement page |
| `/session-expired` | [`app/session-expired/page.tsx`](app/session-expired/page.tsx) | Session timeout redirect handler |
| `/api/public-config` | [`app/api/public-config/route.ts`](app/api/public-config/route.ts) | Public application runtime configuration API |

---

## 🗝️ Core Architecture & Key Concepts

### 1. Money Handling & Kobo Precision
- All monetary amounts in the database and API are processed as **integers in Kobo** (`1 NGN = 100 Kobo`) to prevent floating-point rounding errors.
- Display formatting helper functions ([`lib/format.ts`](lib/format.ts)) convert kobo values into properly localized Nigerian Naira strings (`₦X.XX`).

### 2. Dual Authentication Architecture
- **Customer Auth (`AuthProvider`)**: Uses JWT tokens (`access_token`, `refresh_token`) stored securely with automatic token refresh via [`lib/api/client.ts`](lib/api/client.ts).
- **Staff Auth (`StaffAuthProvider`)**: Separate authentication context protecting all `/staff/*` administrative endpoints ([`lib/staff/auth/auth-context.tsx`](lib/staff/auth/auth-context.tsx)).
- **Middleware Protection**: [`middleware.ts`](middleware.ts) enforces session presence on `/app/*` and `/onboarding/*` routes.

### 3. Open Banking & Bank Integration
- Integrates with **Mono API** for real-time Nigerian bank balance retrieval, statement syncing, and transaction categorization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `^18.18` or `>=20.0`
- `npm` or `pnpm`

### Installation
```bash
# Clone repository
git clone https://github.com/ryport-org/ryport-frontend.git
cd ryport-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Configuration (`.env.local`)
```env
NEXT_PUBLIC_API_URL=https://ryport.onrender.com
NEXT_PUBLIC_APP_URL=https://www.ryport.com.ng
```

### Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Commands & Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Development | `npm run dev` | Starts Next.js development server with Turbopack |
| Build | `npm run build` | Builds production bundle |
| Production Start | `npm run start` | Runs compiled production server |
| Linting | `npm run lint` | Executes ESLint analysis |
| Testing | `npm run test` | Runs unit tests with Vitest |

---

## 📚 Developer Documentation

For deeper architectural details and API integrations, consult the documentation directory:

- [`docs/frontend-dev-handoff.md`](docs/frontend-dev-handoff.md) — Handoff guide, money rules, bootstrap requirements.
- [`docs/frontend-integration.md`](docs/frontend-integration.md) — Comprehensive API endpoint map & sitemap documentation.
- [`docs/staff-api-integration.md`](docs/staff-api-integration.md) — Staff portal API integration specs.
- [`docs/staff-frontend-endpoints.md`](docs/staff-frontend-endpoints.md) — Staff frontend endpoint mapping.
