"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, Paperclip, Send, Sparkles, X, ShieldAlert } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { ChatMessage, Conversation } from "@/lib/api/types";
import {
  getAiErrorMessage,
  isQuotaExceeded,
  looksLikeAiMisconfiguration,
} from "@/lib/ai/errors";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { ChatMessageContent } from "@/components/ai/chat-message-content";

const suggestions = [
  "Where did my money go this month?",
  "What's my biggest expense?",
  "Am I over budget on food?",
];

function formatMessageTime(createdAt?: string): string {
  if (!createdAt) return "11:51";
  try {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return "11:51";
    return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "11:51";
  }
}

export default function AiChatPage() {
  const router = useRouter();
  const { aiQuota, refreshAiQuota } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await aiApi.conversations();
      setConversations(list);
    } catch {
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    void refreshAiQuota();
    void loadConversations();
  }, [loadConversations, refreshAiQuota]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isLimitReached = Boolean(aiQuota && !aiQuota.is_unlimited && aiQuota.remaining <= 0);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSidebarOpen(false);

    if (isLimitReached) {
      setError(
        new ApiError(
          "quota_exceeded",
          "You have reached your daily limit of 10 AI chat questions. Upgrade to Pro for unlimited AI chat.",
          403,
        ),
      );
      setLoading(false);
      return;
    }

    try {
      const res = await aiApi.chat(trimmed, conversationId);
      const reply = res.reply || res.response;
      setConversationId(res.conversation_id);
      setMessages((m) => [
        ...m,
        {
          id: res.message_id || crypto.randomUUID(),
          role: "assistant",
          content: reply,
          created_at: new Date().toISOString(),
        },
      ]);
      if (looksLikeAiMisconfiguration(reply)) {
        setError(new Error(reply));
      }
      await Promise.all([refreshAiQuota(), loadConversations()]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadConversation(id: string) {
    setLoadingThread(true);
    setError(null);
    try {
      const conv = await aiApi.conversation(id);
      setConversationId(id);
      setMessages(conv.messages ?? []);
      setSidebarOpen(false);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingThread(false);
    }
  }

  function startNewChat() {
    setConversationId(undefined);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const attachmentPrompt = `Attached file: ${file.name}. Please summarize spending and risks.`;
    void send(attachmentPrompt);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const quotaLabel = aiQuota
    ? aiQuota.is_unlimited
      ? "Unlimited messages"
      : `${aiQuota.remaining} of ${aiQuota.limit} left today`
    : null;

  const conversationSidebar = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-mist">Conversations</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-8 px-2 text-xs" onClick={startNewChat}>
            New
          </Button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-mist hover:bg-paper lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close conversations"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-mist">No conversations yet</li>
        ) : (
          conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => loadConversation(c.id)}
                disabled={loadingThread}
                className={cn(
                  "w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  conversationId === c.id
                    ? "bg-sky-soft text-sky font-semibold"
                    : "text-mist hover:bg-paper hover:text-ink",
                )}
              >
                {c.title ?? "Conversation"}
              </button>
            </li>
          ))
        )}
      </ul>
      {quotaLabel ? (
        <p className="shrink-0 border-t border-line px-4 py-3 text-xs text-mist">{quotaLabel}</p>
      ) : null}
    </>
  );

  const currentErrorObj =
    error ||
    (isLimitReached
      ? new ApiError(
          "quota_exceeded",
          "You have reached your daily limit of 10 AI chat questions. Upgrade to Pro for unlimited AI chat.",
          403,
        )
      : null);

  return (
    <AppPage>
      <AppHeader
        title="AI Chat"
        description="Ask anything about your finances in plain English"
        action={
          <div className="flex items-center gap-2">
            {aiQuota && !aiQuota.is_unlimited ? (
              <span className="hidden text-xs text-mist sm:inline">
                {aiQuota.remaining} messages left
              </span>
            ) : null}
            <Button
              variant="ghost"
              className="gap-1.5 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-4" />
              Chats
            </Button>
            <Button variant="ghost" onClick={() => router.push("/app/ai")} className="gap-1.5">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">AI Hub</span>
            </Button>
          </div>
        }
      />

      <AppPageBody scroll={false} className="relative flex min-h-0 flex-1 flex-row overflow-hidden bg-paper">
        <aside className="hidden w-56 shrink-0 flex-col overflow-hidden border-r border-line bg-white lg:flex xl:w-64">
          {conversationSidebar}
        </aside>

        {sidebarOpen ? (
          <>
            <button
              type="button"
              className="absolute inset-0 z-40 bg-ink/20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close overlay"
            />
            <aside className="absolute inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col overflow-hidden border-r border-line bg-white shadow-lg lg:hidden">
              {conversationSidebar}
            </aside>
          </>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {loadingThread ? (
              <div className="mx-auto max-w-2xl py-12 text-center text-sm text-mist">
                Loading conversation…
              </div>
            ) : messages.length === 0 ? (
              <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-sky-soft">
                  <Sparkles className="size-5 text-sky" />
                </div>
                <h2 className="mt-4 font-display text-xl text-ink sm:text-2xl">
                  What would you like to know?
                </h2>
                <p className="mt-2 text-sm text-mist">
                  Ryport reads your transactions and answers in plain English.
                </p>
                <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      disabled={loading}
                      className="rounded-full border border-line bg-white px-4 py-2.5 text-left text-sm text-ink transition-colors hover:border-sky hover:bg-sky-soft sm:text-center disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "user" ? (
                      <div className="flex flex-col items-end max-w-[min(100%,82%)] sm:max-w-[min(100%,75%)]">
                        <div className="rounded-2xl rounded-tr-xs bg-ink px-4 py-3 text-sm font-medium leading-relaxed text-white shadow-xs break-words">
                          <ChatMessageContent content={msg.content} role="user" />
                        </div>
                        <span className="mt-1 px-1 text-[11px] font-medium text-mist">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start max-w-[min(100%,90%)] sm:max-w-[min(100%,84%)]">
                        <div
                          className={cn(
                            "w-full rounded-2xl rounded-tl-xs border border-line bg-white p-4 sm:p-5 text-sm leading-relaxed text-ink shadow-xs break-words",
                            looksLikeAiMisconfiguration(msg.content) && "border-coral-warn/40 text-coral-warn"
                          )}
                        >
                          <ChatMessageContent content={msg.content} role="assistant" />

                          <div className="mt-3 flex items-center justify-end gap-2 border-t border-line/60 pt-2 text-[11px] font-medium text-mist select-none">
                            <span>NVIDIA: Nemotron 3 Super (free)</span>
                            <span>{formatMessageTime(msg.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-xs border border-line bg-white px-4 py-3 text-sm text-mist flex items-center gap-2">
                      <span className="size-2 rounded-full bg-sky animate-ping" />
                      Thinking…
                    </div>
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            )}

            {currentErrorObj ? (
              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-sky/30 bg-white p-6 text-center shadow-md shadow-sky/5">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                  {isQuotaExceeded(currentErrorObj) ? (
                    <Sparkles className="size-6 text-brand" />
                  ) : (
                    <ShieldAlert className="size-6 text-coral-warn" />
                  )}
                </div>

                <h3 className="mt-3 font-display text-xl font-bold text-ink">
                  {isQuotaExceeded(currentErrorObj)
                    ? "Daily 10 AI Question Limit Reached"
                    : "AI Chat Notice"}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-mist">
                  {getAiErrorMessage(currentErrorObj)}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/app/upgrade"
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 hover:bg-brand/90 transition-all"
                  >
                    Upgrade to Pro — ₦5,000/mo
                  </Link>
                  {aiQuota?.resets_at ? (
                    <span className="text-xs text-mist">
                      Resets at{" "}
                      {new Date(aiQuota.resets_at).toLocaleTimeString("en-NG", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-line bg-white px-3 py-3 sm:px-6 sm:py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="mx-auto flex max-w-3xl items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.csv,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-mist transition-colors hover:border-sky hover:text-ink focus:outline-none focus:ring-2 focus:ring-sky"
                title="Attach file or expense receipt"
                aria-label="Attach file"
              >
                <Paperclip className="size-4" />
              </button>

              <div className="relative flex min-w-0 flex-1 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isLimitReached
                      ? "Daily 10 question limit reached. Upgrade to continue..."
                      : "Ask Peach..."
                  }
                  disabled={loading || loadingThread}
                  maxLength={4000}
                  className="w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-mist focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading || loadingThread || !input.trim()}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-xs transition-all hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-sky disabled:opacity-40 disabled:hover:bg-brand"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </AppPageBody>
    </AppPage>
  );
}
