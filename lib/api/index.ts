import * as auth from "@/lib/api/auth";
import * as users from "@/lib/api/users";
import * as accounts from "@/lib/api/accounts";
import * as transactions from "@/lib/api/transactions";
import * as budgets from "@/lib/api/budgets";
import * as reports from "@/lib/api/reports";
import * as ai from "@/lib/api/ai";
import * as notifications from "@/lib/api/notifications";
import * as businesses from "@/lib/api/businesses";
import * as teams from "@/lib/api/teams";
import * as integrations from "@/lib/api/integrations";
import type { CursorPage, Transaction } from "@/lib/api/types";

export function normalizeTransactions(
  data: CursorPage<Transaction> | Transaction[],
): Transaction[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

/** Extract opaque cursor token from a paginated `next` URL. */
export function extractCursor(next: string | null | undefined): string | undefined {
  if (!next) return undefined;
  try {
    return new URL(next).searchParams.get("cursor") ?? undefined;
  } catch {
    const match = next.match(/[?&]cursor=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  }
}

export const authApi = {
  register: auth.register,
  login: auth.login,
  requestOtp: auth.requestOtp,
  verifyOtp: auth.verifyOtp,
  refresh: auth.refreshToken,
  logout: auth.logout,
  listOAuthProviders: auth.listOAuthProviders,
  startOAuth: auth.startOAuth,
  oauthCallback: (code: string, state?: string, totp_token?: string) =>
    auth.oauthCallback({ code, state, totp_token }),
  enable2fa: auth.enable2fa,
  confirm2fa: auth.confirm2fa,
  disable2fa: auth.disable2fa,
  getBackupCodes: auth.getBackupCodes,
  regenerateBackupCodes: auth.regenerateBackupCodes,
};

export const usersApi = {
  me: users.getMe,
  plan: users.getPlan,
};

export const accountsApi = {
  list: accounts.listAccounts,
  connect: accounts.linkAccount,
  get: accounts.getAccount,
  remove: accounts.disconnectAccount,
  sync: accounts.syncAccount,
};

export const transactionsApi = {
  list: transactions.listTransactions,
  get: transactions.getTransaction,
  create: transactions.createTransaction,
  remove: transactions.deleteTransaction,
  categorise: transactions.categoriseTransaction,
  uploadReceipt: transactions.uploadReceipt,
};

export const budgetsApi = {
  list: budgets.listBudgets,
  create: budgets.createBudget,
  get: budgets.getBudget,
  update: budgets.updateBudget,
  remove: budgets.deleteBudget,
  usage: budgets.getBudgetUsage,
  alerts: budgets.getBudgetAlerts,
  checkAlerts: budgets.checkBudgetAlerts,
};

export const reportsApi = {
  list: reports.listReports,
  generate: reports.generateReport,
  get: reports.getReport,
  export: reports.exportReport,
};

export const aiApi = {
  quota: ai.getAiQuota,
  chat: (token: string, message: string, conversation_id?: string) =>
    ai.sendChat(token, { message, conversation_id }),
  conversations: ai.listConversations,
  conversation: ai.getConversation,
  cashFlowPredict: (token: string, days = 30) => ai.getCashFlowPrediction(token, days),
  subscriptions: ai.getSubscriptions,
  budgetRecommendations: ai.getBudgetRecommendations,
  applyBudgetRecommendations: ai.applyBudgetRecommendations,
  cfoAnalyse: ai.analyseCfo,
  categoriseTransaction: ai.categoriseWithAi,
};

export const notificationsApi = {
  list: notifications.listNotifications,
  unreadCount: notifications.getUnreadCount,
  readAll: notifications.markAllRead,
  get: notifications.getNotification,
  markRead: notifications.markRead,
};

export const businessesApi = {
  list: businesses.listBusinesses,
  create: businesses.createBusiness,
  active: businesses.getActiveBusiness,
  get: businesses.getBusiness,
  switch: businesses.switchBusiness,
  analytics: businesses.getBusinessAnalytics,
  members: businesses.listMembers,
  inviteMember: businesses.inviteMember,
};

export const teamsApi = {
  previewInvite: teams.previewInvite,
  acceptInvite: teams.acceptInvite,
  listInvites: teams.listInvites,
  revokeInvite: teams.revokeInvite,
};

export const integrationsApi = {
  listApiKeys: integrations.listApiKeys,
  createApiKey: integrations.createApiKey,
  revokeApiKey: integrations.revokeApiKey,
};

export { ApiError, apiRequest, healthCheck } from "@/lib/api/client";
export type * from "@/lib/api/types";
