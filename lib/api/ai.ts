import { apiRequest } from "@/lib/api/client";
import type {
  CashFlowPrediction,
  ChatQuota,
  ChatResponse,
  Conversation,
} from "@/lib/api/types";

export const aiApi = {
  chat: (token: string, message: string, conversationId?: string) =>
    apiRequest<ChatResponse>("/ai/chat/", {
      method: "POST",
      token,
      body: { message, conversation_id: conversationId },
    }),

  quota: (token: string) =>
    apiRequest<ChatQuota>("/ai/chat/quota/", { token }),

  conversations: (token: string) =>
    apiRequest<Conversation[]>("/ai/conversations/", { token }),

  conversation: (token: string, id: string) =>
    apiRequest<Conversation>(`/ai/conversations/${id}/`, { token }),

  cfoAnalyse: (token: string) =>
    apiRequest<Record<string, unknown>>("/ai/cfo/analyse/", {
      method: "POST",
      token,
    }),

  cashFlowPredict: (token: string) =>
    apiRequest<CashFlowPrediction>("/ai/cash-flow/predict/", { token }),
};
