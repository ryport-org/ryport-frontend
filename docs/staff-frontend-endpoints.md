# Staff dashboard — frontend endpoint map

**UI base:** `https://www.ryport.com.ng/staff`  
**API base:** `https://ryport.onrender.com/staff/api/v1/`  
**Client:** `lib/staff/api/` · **Routes:** `app/staff/`

Quick reference for which page calls which endpoint. All paths are relative to `/staff/api/v1/`.

---

## Auth (`/staff/login`, `/staff/accept-invite`, `/staff/settings`)

| Page | Method | Path | Module |
|------|--------|------|--------|
| Login | POST | `auth/login/` | `staffAuthApi.login` |
| Session refresh | POST | `auth/refresh/` | `staffAuthApi.refresh` |
| Logout | POST | `auth/logout/` | `staffAuthApi.logout` |
| Bootstrap / nav | GET | `auth/me/` | `staffAuthApi.me` |
| Settings profile | PATCH | `auth/me/` | `staffAuthApi.updateMe` |
| Settings password | POST | `auth/change-password/` | `staffAuthApi.changePassword` |
| Accept invite | POST | `staff/accept-invite/` | `staffAuthApi.acceptInvite` |

---

## Dashboard (`/staff`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| KPIs, alerts, activity | GET | `dashboard/overview/` | `staffDashboardApi.getOverview` |
| User growth chart | GET | `dashboard/charts/user-growth/?days=30` | `staffDashboardApi.getUserGrowthChart` |
| Revenue chart | GET | `dashboard/charts/revenue/?months=12` | `staffDashboardApi.getRevenueChart` |
| Transactions chart | GET | `dashboard/charts/transactions/?days=30` | `staffDashboardApi.getTransactionsChart` |
| AI usage chart | GET | `dashboard/charts/ai-usage/?days=14` | `staffDashboardApi.getAiUsageChart` |

---

## Users (`/staff/users`, `/staff/users/:id`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| User list | GET | `users/?plan=&q=&page=` | `staffUsersApi.listUsers` |
| User detail | GET | `users/:id/` | `staffUsersApi.getUser` |
| Suspend | POST | `users/:id/suspend/` | `staffUsersApi.suspendUser` |
| Unsuspend | POST | `users/:id/unsuspend/` | `staffUsersApi.unsuspendUser` |
| Reset password | POST | `users/:id/reset-password/` | `staffUsersApi.resetUserPassword` |
| Change plan | PATCH | `users/:id/change-plan/` | `staffUsersApi.changeUserPlan` |
| List notes | GET | `users/:id/notes/` | `staffUsersApi.listUserNotes` |
| Add note | POST | `users/:id/notes/` | `staffUsersApi.addUserNote` |
| Export CSV | GET | `users/export/` | `staffUsersApi.exportUsers` |

---

## Revenue (`/staff/revenue`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| Summary cards | GET | `revenue/summary/` | `staffRevenueApi.getSummary` |
| MRR chart | GET | `revenue/charts/mrr/?months=12` | `staffRevenueApi.getMrrChart` |
| Upgrades chart | GET | `revenue/charts/upgrades/?months=6` | `staffRevenueApi.getUpgradesChart` |
| Plan changes | GET | `revenue/plan-changes/` | `staffRevenueApi.listPlanChanges` |

---

## Analytics (`/staff/analytics`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| Feature adoption | GET | `analytics/feature-adoption/` | `staffAnalyticsApi.getFeatureAdoption` |
| Engagement | GET | `analytics/engagement/` | `staffAnalyticsApi.getEngagement` |
| AI | GET | `analytics/ai/` | `staffAnalyticsApi.getAiAnalytics` |
| Banking | GET | `analytics/banking/` | `staffAnalyticsApi.getBankingAnalytics` |
| Transactions | GET | `analytics/transactions/` | `staffAnalyticsApi.getTransactionAnalytics` |

---

## Support (`/staff/support`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| Flagged users | GET | `support/flagged-users/` | `staffSupportApi.getFlaggedUsers` |
| Flagged notes | GET | `support/notes/?is_flagged=true` | `staffSupportApi.listNotes` |

---

## Announcements (`/staff/announcements`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| List | GET | `announcements/` | `staffAnnouncementsApi.listAnnouncements` |
| Create | POST | `announcements/` | `staffAnnouncementsApi.createAnnouncement` |
| Detail | GET | `announcements/:id/` | `staffAnnouncementsApi.getAnnouncement` |
| Preview | POST | `announcements/:id/preview/` | `staffAnnouncementsApi.previewAnnouncement` |

---

## Staff management (`/staff/staff`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| List team | GET | `staff/` | `staffManagementApi.listStaff` |
| Invite | POST | `staff/invite/` | `staffManagementApi.inviteStaff` |
| Pending invites | GET | `staff/invites/` | `staffManagementApi.listInvites` |
| Revoke invite | DELETE | `staff/invites/:id/` | `staffManagementApi.revokeInvite` |
| Deactivate | POST | `staff/:id/deactivate/` | `staffManagementApi.deactivateStaff` |
| Reactivate | POST | `staff/:id/reactivate/` | `staffManagementApi.reactivateStaff` |

---

## Audit (`/staff/audit`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| Log table | GET | `audit/?page=` | `staffAuditApi.listAudit` |
| CSV export | GET | `audit/export/` | `staffAuditApi.exportAudit` |

---

## System (`/staff/system`)

| UI | Method | Path | Module |
|----|--------|------|--------|
| Health | GET | `system/health/` | `staffSystemApi.getHealth` |
| Celery | GET | `system/celery/` | `staffSystemApi.getCelery` |
| Errors | GET | `system/errors/` | `staffSystemApi.getErrors` |
| Alerts | GET | `system/alerts/?resolved=false` | `staffSystemApi.listAlerts` |
| Create alert | POST | `system/alerts/` | `staffSystemApi.createAlert` |
| Resolve alert | POST | `system/alerts/:id/resolve/` | `staffSystemApi.resolveAlert` |

---

## Token storage

- Keys: `staff_access_token`, `staff_refresh_token` in `localStorage`
- Wrapper: `lib/staff/api/client.ts` → `staffRequest()`
- On 401: refresh once, then redirect to `/staff/login`

---

## Related

- [`staff-api-integration.md`](./staff-api-integration.md) — full API spec
- [`staff-dashboard-backend-requirements.md`](./staff-dashboard-backend-requirements.md) — backend sprint checklist
