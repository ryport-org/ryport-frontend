import { apiRequest, apiRequestWithMeta } from "@/lib/api/client";
import type {
  AIQuota,
  AiCategoriseResult,
  AppliedBudgetRecommendation,
  BudgetRecommendation,
  CashFlowPrediction,
  CfoAnalysis,
  ChatResponse,
  Conversation,
  SubscriptionItem,
} from "@/lib/api/types";

export async function getAiQuota(token: string) {
  return apiRequest<AIQuota>("/ai/chat/quota/", { token });
}

export async function sendChat(
  token: string,
  body: { message: string; conversation_id?: string },
) {
  const payload: { message: string; conversation_id?: string } = {
    message: body.message,
  };
  if (body.conversation_id) {
    payload.conversation_id = body.conversation_id;
  }
  return apiRequest<ChatResponse>("/ai/chat/", { method: "POST", body: payload, token });
}

export async function listConversations(token: string) {
  return apiRequest<Conversation[]>("/ai/conversations/", { token });
}

export async function getConversation(token: string, id: string) {
  return apiRequest<Conversation>(`/ai/conversations/${id}/`, { token });
}

export async function categoriseWithAi(token: string, transactionId: string) {
  return apiRequest<AiCategoriseResult>(
    `/ai/transactions/${transactionId}/categorise/`,
    { method: "POST", token },
  );
}

export async function getCashFlowPrediction(token: string, days = 30) {
  const clamped = Math.min(90, Math.max(1, days));
  return apiRequest<CashFlowPrediction>(
    `/ai/cash-flow/predict/?days=${clamped}`,
    { token },
  );
}

export async function getSubscriptions(token: string, refresh = false) {
  const qs = refresh ? "?refresh=true" : "";
  return apiRequest<SubscriptionItem[]>(`/ai/subscriptions/${qs}`, { token });
}

export async function getBudgetRecommendations(token: string) {
  return apiRequest<BudgetRecommendation[]>("/ai/budget-recommendations/", {
    token,
  });
}

export async function applyBudgetRecommendations(token: string) {
  return apiRequest<AppliedBudgetRecommendation[]>(
    "/ai/budget-recommendations/apply/",
    { method: "POST", token },
  );
}

export async function analyseCfo(token: string, businessId?: string) {
  const { data, cached } = await apiRequestWithMeta<CfoAnalysis>("/ai/cfo/analyse/", {
    method: "POST",
    body: businessId ? { business_id: businessId } : {},
    token,
  });
  return { ...data, cached: cached ?? data.cached };
}
