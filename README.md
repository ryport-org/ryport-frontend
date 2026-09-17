<div align="center">
  <img src="public/logo.png" alt="Ryport Logo" width="160" />
  <h1>Ryport</h1>
  <p><b>AI-Powered Financial Operating System for Nigeria</b></p>
  <p>Real-time banking, automated kobo-precision accounting, multi-business management, and an executive AI CFO assistant.</p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Django_REST-5.x-darkgreen?style=flat-square&logo=django" alt="Django REST" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Database-PostgreSQL_%2F_Supabase-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/AI_Engine-Anthropic_Claude-orange?style=flat-square&logo=anthropic" alt="Claude AI" />
    <img src="https://img.shields.io/badge/Bank_SMS-Capture-10B981?style=flat-square" alt="SMS Capture" />
    <img src="https://img.shields.io/badge/Payments-Paystack-0BA4DB?style=flat-square" alt="Paystack" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  </div>
</div>

---

## 📌 Executive Summary

**Ryport** is a full-stack, enterprise-grade financial operating system designed specifically for the Nigerian financial ecosystem. Built to solve fragmented financial visibility, manual book-keeping, and rounding errors, Ryport provides automated transaction capture via SMS bank alert parsing, real-time transaction categorisation in strict Kobo integer precision, multi-entity business accounting, smart budgeting, and a dedicated conversational **AI Chief Financial Officer (CFO)** powered by Anthropic Claude.

Ryport serves individuals, freelancers, high-growth agencies, and Small & Medium Enterprises (SMEs) with bank-grade security, instant financial reporting, and comprehensive administrative governance.

---

## 🏗️ System Architecture

Ryport operates on a modern, decoupled client-server architecture engineered for high availability, low latency, and zero floating-point rounding errors.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                         │
│  Customer Web App (Next.js 16 App Router)  │  Staff Portal (/staff/*)  │  PWA Clients  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / JWT Bearer Authentication
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY & BACKEND ENGINE                              │
│                               Django REST Framework (DRF)                              │
│                      Hosted on Render (https://ryport.onrender.com)                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  • Plan Gating Middleware      • Dual Token Auth (Customer / Staff)                    │
│  • Idempotency Verification    • Kobo Math Conversion Layer                            │
│  • Rate Limiting & Quotas      • Request Tracing (X-Request-ID)                        │
└─────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬───────┘
      │              │              │              │              │              │
      ▼              ▼              ▼              ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│ PostgreSQL│  │   Redis   │  │  Celery   │  │ Anthropic │  │    SMS    │  │ Paystack  │
│(Supabase) │  │ (Upstash) │  │  Workers  │  │ Claude AI │  │  Capture  │  │ Payments  │
└───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘
      │
      ▼
┌───────────┐
│  Resend   │ (21 Responsive HTML Email Templates for transactional alerts)
└───────────┘
```

---

## 🌟 Core Features & Modules

### 1. 📱 SMS Bank Alert Capture
- **Intelligent Nigerian Bank SMS Ingestion**: Users forward or paste bank debit/credit alert SMS messages from all major institutions (Access, GTBank, Zenith, UBA, First Bank, Kuda, OPay).
- **Automated Ledger Creation**: Intelligent backend parsing extracts amount, merchant, date, and assigns spending categories automatically.
- **Duplicate Detection & Idempotency**: Built-in duplicate filtering ensures the same SMS alert is never counted twice.
- **Instant Verification**: Review parsed transaction confirmation cards immediately with 1-click ledger navigation.

### 2. 💳 Transaction Engine & Zero-Loss Kobo Precision
- **Exact Kobo Arithmetic**: All financial calculations, storage, and transfers are conducted strictly as integers in **Kobo** (`1 NGN = 100 Kobo`), completely eliminating JavaScript floating-point errors (`0.1 + 0.2 != 0.3`).
- **Real-Time Stream**: High-performance transaction streaming with cursor-based pagination for fluid scrolling through tens of thousands of records.
- **Rule-Based & AI Categorization**: Transactions are automatically assigned categories (Food, Utilities, Logistics, Payroll, Software, etc.) using custom rules and AI inference.
- **Receipt Capture & Attachments**: Direct multi-part image uploads for expense receipts linked directly to ledger entries.
- **Idempotency Guarantees**: Mutation requests enforce client-generated idempotency keys (`idempotency_key`) to prevent duplicate transactions on network retries.

### 3. 📊 Smart Budgeting & Expense Control
- **Category-Level Spending Limits**: Set monthly and quarterly expense limits across customized categories.
- **Proactive Threshold Alerts**: Real-time warnings triggered at critical thresholds (80% warning, 100% exceeded) via in-app notifications and email.
- **Rollover & Variance Analysis**: Automatic tracking of overspend and unspent allocations month-over-month.

### 4. 🤖 Executive AI CFO & Financial Intelligence Hub
Powered by Anthropic Claude and custom financial prompt orchestration:
- **Conversational AI CFO (`/app/ai/chat`)**: Ask complex financial questions in natural language (e.g., *"What was our burn rate in Q2 vs Q1?"*, *"How much did we spend on logistics this month?"*).
- **Executive AI Summary (`/app/ai/cfo`)**: Auto-generated executive summaries providing actionable financial health diagnoses, key risks, and cost-saving recommendations.
- **Liquidity & Cash Flow Projections (`/app/ai/cash-flow`)**: Predictive analytics forecasting future bank balances based on recurring revenue and historical spending velocity.
- **Subscription & Recurring Bill Detector (`/app/ai/subscriptions`)**: Automated heuristic detection of recurring SaaS subscriptions and utility fees to identify forgotten or duplicate charges.
- **Smart Budget Recommendations (`/app/ai/budgets`)**: AI-generated optimal spending caps tailored to income patterns and business margins.

### 5. 🏢 Multi-Business & Team Workspace Management
- **Multi-Entity Directory**: Switch effortlessly between personal finances and multiple distinct business workspaces.
- **Granular Role-Based Access Control (RBAC)**: Assign roles with strict permission boundaries (`Owner`, `Admin`, `Member`, `Viewer`).
- **Team Invitation Lifecycles**: Generate time-limited secure invitations, handle email verification, and manage team seats.
- **Consolidated vs. Entity Analytics**: View P&L and revenue metrics isolated to specific workspaces or consolidated across corporate entities.

### 6. 📑 Financial Reporting & Export Engine
- **Standard Accounting Statements**: Instant generation of Profit & Loss (P&L) statements, Cash Flow summaries, and Periodic Revenue Reports.
- **Multi-Format Document Export**: High-fidelity export to **PDF**, **CSV**, and **Excel (XLSX)** for audits, tax filing, and investor presentations.
- **Filterable Date Ranges**: Custom fiscal periods, calendar quarters, or trailing twelve months (TTM).

### 7. ⚡ Subscriptions, Billing & Paystack Integration
- **Tiered Plans**: Flexible pricing models (`Free`, `Starter`, `Pro`, `Enterprise`) matching business scale.
- **Server-Enforced Plan Gating**: Feature gates evaluated in middleware, returning standard `403` envelopes with upgrade triggers when limits are reached.
- **Paystack Payment Gateway**: Native checkout for Nigerian Naira debit/credit cards, bank transfers, and automated recurring billing renewals.

### 8. 🔔 Notification Engine & Transactional Messaging
- **Unified In-App Inbox**: Real-time notification center for budget breaches, transaction syncs, team updates, and system announcements.
- **Transactional Email Suite**: 21 responsive HTML email templates powered by Resend (login OTPs, weekly digests, budget alerts, team invites).

### 9. 🛡️ Staff Administration & Internal Ops Portal
Dual-layered administrative tools:
- **Next.js Staff Portal (`/staff/*`)**: Dedicated internal administration interface with separate staff JWT authentication context.
  - User and workspace search & inspection
  - Platform revenue, active subscription metrics, and feature telemetry
  - Customer support ticket desk
  - Global in-app announcements publishing
  - Comprehensive security & audit logs
- **Django Server-Rendered Ops (`/ryport-ops/`)**: Low-overhead internal operations dashboard for technical and DevOps staff.

### 10. 🔒 Security, Compliance & Data Governance
- **Dual Authentication**: Completely isolated JWT lifecycle contexts for customers and staff (`access_token` [30m], `refresh_token` [7d] with automatic rotation).
- **Two-Factor Authentication (2FA/OTP)**: Email OTP verification for logins and sensitive operations.
- **End-to-End Auditing**: Audit trails recording user logins, financial mutations, and staff interactions.
- **Tracing & Observability**: Unique `X-Request-ID` attached to all request/response cycles and integrated with Sentry error monitoring.

---

## 🖥️ Dashboard & Application Structure

Ryport encompasses 60+ responsive pages structured across logical route groups:

```
app/
├── (marketing)/                  # Public SEO & Product Showcase
│   ├── page.tsx                  # Homepage & Interactive Product Hero
│   ├── features/                 # Detailed Feature Capabilities
│   ├── pricing/                  # Plan Matrix & Interactive Tier Selector
│   ├── why-ryport/               # Comparison with Legacy Accounting
│   ├── ai-insights/              # AI CFO Engine Overview
│   ├── integrations/             # Open Banking & Mono Integration Showcase
│   ├── solutions/                # Vertical pages: SMEs, Freelancers, Agencies
│   └── (legal)/                  # Privacy, Terms of Service, Cookie Policy
│
├── (auth)/                       # Authentication & Multi-Step Onboarding
│   ├── login/                    # Customer Login with JWT & OTP Support
│   ├── register/                 # Account Registration
│   ├── reset-password/           # Password Recovery Flow
│   ├── onboarding/segment/       # Personal vs Business Profile Selection
│   ├── onboarding/business/      # Business Setup & Workspace Initialization
│   └── invites/accept/           # Team Invitation Acceptance Handler
│
├── app/                          # Main Customer Application Hub
│   ├── dashboard/                # Central Overview (Balances, Quick Stats, AI Feed)
│   ├── accounts/                 # Connected Bank Accounts Hub
│   ├── transactions/             # Kobo-precision Transaction Ledger & Filters
│   │   └── sms-import/           # SMS alert paste & ingestion
│   ├── debts/                    # Debts & receivables ledger
│   ├── budgets/                  # Budget Caps, Usage Progress, Threshold Warnings
│   ├── cash-flow/                # 90-day cash-flow chart
│   ├── reports/                  # Financial Reports (P&L, Cash Flow, PDF/CSV Export)
│   ├── businesses/               # Multi-Business Switcher & Entity Analytics
│   ├── notifications/            # In-App Notification Center
│   ├── upgrade/                  # Subscription Plan Manager & Paystack Checkout
│   ├── settings/                 # Profile, 2FA Security, Sessions, Notifications & API Keys
│   └── ai/                       # AI Financial Suite
│       ├── cfo/                  # Executive Financial Health Summary
│       ├── chat/                 # Natural Language AI CFO Conversational Assistant
│       ├── cash-flow/            # Predictive Liquidity & Cash Flow Forecasts
│       ├── subscriptions/        # Recurring Subscription & SaaS Leak Detector
│       └── budgets/              # AI Smart Budget Recommendations
│
├── staff/                        # Staff & Operations Admin Suite
│   ├── login/                    # Dedicated Staff Authentication
│   └── (shell)/
│       ├── page.tsx              # Platform Overview & Key Metrics
│       ├── users/                # User & Workspace Management Directory
│       ├── analytics/            # System Usage & Feature Telemetry
│       ├── revenue/              # Platform Subscription & MRR Metrics
│       ├── support/              # Customer Support Desk
│       ├── announcements/        # Broadcast Announcements Manager
│       ├── system/               # Service Health & Webhook Status
│       └── audit/                # Comprehensive Platform Audit Trail
│
└── 403 / maintenance / session-expired # Global System Fallbacks & Boundaries
```

---

## 🛠️ Technology Stack Matrix

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Turbopack compilation, React Server Components (RSC), SSR |
| **UI Library & Styling** | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Modern styling engine, fluid responsive layouts, Lucide Icons |
| **Frontend State & Auth** | Supabase SSR + Custom Dual Auth Contexts | Secure HttpOnly cookies, JWT Bearer auto-refresh, role protection |
| **Backend Framework** | [Django REST Framework (DRF)](https://www.django-rest-framework.org/) | Modular Django apps (`users`, `accounts`, `transactions`, `budgets`, `reports`, `ai`, `businesses`, `teams`, `notifications`) |
| **Database** | [PostgreSQL (Supabase)](https://supabase.com/) | ACID relational storage, field encryption, indexed kobo integer columns |
| **Task Queue & Caching** | [Redis (Upstash)](https://upstash.com/) + [Celery](https://docs.celeryq.dev/) | Asynchronous statement syncing, email dispatch, AI background jobs |
| **Artificial Intelligence** | [Anthropic Claude](https://www.anthropic.com/) | Financial context summarization, cash flow modeling, conversational CFO (version is server-configurable) |
| **SMS Parser** | Nigerian bank alert parsing (Mono paused) | Intelligent debit & credit alert parsing for GTBank, Zenith, Access, UBA, First Bank, Kuda, OPay |
| **Payments & Billing** | [Paystack](https://paystack.com/) | NGN card processing, automated recurring billing, checkout popups |
| **Transactional Email** | [Resend](https://resend.com/) | 21 responsive HTML email templates |
| **Monitoring & Telemetry** | [Sentry](https://sentry.io/) | Full-stack error tracking and performance monitoring |
| **Testing** | [Vitest](https://vitest.dev/) & [Pytest](https://pytest.org/) | Unit, component, routing, and end-to-end API test suites |

---

## 📐 Data Conventions & API Standards

### 1. Nigerian Money Handling (Kobo Standard)
All currency values sent to or returned by the API are integers representing Kobo (`₦1.00 = 100 kobo`).
```typescript
// Example: Converting kobo to formatted Nigerian Naira
export function formatKobo(kobo: number): string {
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(naira);
}
// formatKobo(2500050) -> "₦25,000.50"
```

### 2. Standard API Envelopes
All API responses follow consistent JSON wrapping:

**Success Response (`200 OK`, `201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "c39a8264-9dfc-4541-b4ef-fbe4f60e909a",
    "amount_kobo": 4500000,
    "type": "expense",
    "category": "Logistics",
    "source": "sms",
    "created_at": "2026-08-26T10:00:00Z"
  }
}
```

**Error Response (`400`, `401`, `403`, `404`, `429`, `500`):**
```json
{
  "success": false,
  "error": {
    "code": "feature_not_available",
    "message": "AI CFO is only available on Pro and Enterprise tiers.",
    "details": {
      "required_plan": "pro",
      "current_plan": "starter"
    }
  },
  "request_id": "req_84f932e01a"
}
```

### 3. Cursor-Based Pagination
Transaction endpoints implement cursor-based pagination for deterministic list rendering:
```http
GET /api/v1/transactions/?cursor=cD0yMDI2LTA4LTI1&page_size=50&category=Food
```

---

## 🚦 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Python**: `v3.11+` (for backend service)

### 1. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/ryport-org/ryport-frontend.git
cd ryport-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Configure `.env.local`:
```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=https://ryport.onrender.com

# Public Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Open Banking & Payment Keys
# NEXT_PUBLIC_MONO_PUBLIC_KEY=test_pk_...  (Mono paused on backend)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# Sentry Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=
```

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend Environment Checklist (Django DRF)
When hosting or running the backend service (`fluxaro/ryport`), ensure the following environment variables are defined:
```env
ALLOWED_HOSTS=ryport.onrender.com,ryport.com.ng,www.ryport.com.ng,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://app.ryport.com.ng,https://ryport.com.ng,http://localhost:3000
FRONTEND_URL=https://app.ryport.com.ng
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
MONO_SECRET_KEY=test_sk_...
PAYSTACK_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
```

---

## 🧪 Testing & Code Quality

Ryport includes automated test suites covering routing, components, accessibility, and utility logic:

```bash
# Run unit and integration tests with Vitest
npm run test

# Run ESLint static analysis
npm run lint

# Check TypeScript type validity & compile
npm run build
```

---

## 📖 In-Depth Documentation

For detailed architectural deep-dives, refer to the documents in [`docs/`](docs/):
- 📘 [Frontend Integration Guide](docs/frontend-integration.md) — Exhaustive API endpoint directory, payload schemas, and sitemap reference.
- 📙 [Frontend Developer Handoff](docs/frontend-dev-handoff.md) — Nigerian financial formatting rules, auth bootstrap, and plan gating.
- 📕 [Staff Portal API Specification](docs/staff-api-integration.md) — Administrative endpoints, permission matrix, and internal telemetry.
- 📗 [Staff Frontend Endpoints](docs/staff-frontend-endpoints.md) — Route-by-route staff interface mapping.

---

## 📄 License & Security

Copyright © 2026 Ryport. All rights reserved.  
All intellectual property, algorithms, and designs are proprietary to Ryport Technologies Ltd. For security disclosures or vulnerability reporting, contact `security@ryport.com.ng`.
