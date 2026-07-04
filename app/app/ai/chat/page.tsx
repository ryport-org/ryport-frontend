"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, Send, Sparkles, X } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiApi } from "@/lib/api";
import type { ChatMessage, Conversation } from "@/lib/api/types";
import { AiUpgradeLink } from "@/components/ai/ai-upgrade-link";
import {
  getAiErrorMessage,
  isQuotaExceeded,
  looksLikeAiMisconfiguration,
} from "@/lib/ai/errors";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

const suggestions = [
  "Where did my money go this month?",
  "What's my biggest expense?",
  "Am I over budget on food?",
];

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

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSidebarOpen(false);
    try {
      const res = await aiApi.chat(text.trim(), conversationId);
      const reply = res.reply || res.response;
      setConversationId(res.conversation_id);
      setMessages((m) => [
        ...m,
        {
          id: res.message_id,
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
      setMessages((m) => m.filter((msg) => msg.id !== userMsg.id));
      setInput(text.trim());
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
                    ? "bg-sky-soft text-sky"
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

      <AppPageBody scroll={false} className="relative flex min-h-0 flex-1 flex-row overflow-hidden">
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
              <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[min(100%,85%)] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words",
                        msg.role === "user"
                          ? "rounded-br-md bg-ink text-white"
                          : "rounded-bl-md border border-line bg-white text-ink",
                        msg.role === "assistant" && looksLikeAiMisconfiguration(msg.content)
                          ? "border-coral-warn/30 text-coral-warn"
                          : "",
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 text-sm text-mist">
                      Thinking…
                    </div>
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            )}
            {error ? (
              <div className="mx-auto mt-4 max-w-2xl text-center text-sm text-coral-warn">
                <p>{getAiErrorMessage(error)}</p>
                {isQuotaExceeded(error) ? (
                  <p className="mt-2">
                    <AiUpgradeLink error={error} /> or try again after{" "}
                    {aiQuota?.resets_at
                      ? new Date(aiQuota.resets_at).toLocaleTimeString("en-NG", {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "midnight"}
                    .
                  </p>
                ) : (
                  <p className="mt-2">
                    <Link href="/app/upgrade" className="font-semibold text-sky hover:underline">
                      View plans
                    </Link>
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-line bg-white px-4 py-3 sm:px-6 sm:py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="mx-auto flex max-w-2xl gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask where your money went…"
                disabled={loading || loadingThread}
                maxLength={4000}
                className="min-w-0 flex-1"
              />
              <Button
                type="submit"
                disabled={loading || loadingThread || !input.trim()}
                className="shrink-0 px-4"
              >
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </AppPageBody>
    </AppPage>
  );
}
