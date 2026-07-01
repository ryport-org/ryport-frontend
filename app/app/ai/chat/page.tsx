"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, Send, Sparkles, X } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/auth/tokens";
import { aiApi } from "@/lib/api";
import type { AIQuota, ChatMessage, Conversation } from "@/lib/api/types";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

const suggestions = [
  "Where did my money go this month?",
  "What's my biggest expense?",
  "Am I over budget on food?",
];

export default function AiChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [quota, setQuota] = useState<AIQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    aiApi.quota(token).then(setQuota).catch(() => null);
    aiApi.conversations(token).then(setConversations).catch(() => []);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const token = getAccessToken();
    if (!token || !text.trim()) return;
    setLoading(true);
    setError("");
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
      const res = await aiApi.chat(token, text.trim(), conversationId);
      setConversationId(res.conversation_id);
      setMessages((m) => [
        ...m,
        {
          id: res.message_id,
          role: "assistant",
          content: res.reply || res.response,
          created_at: new Date().toISOString(),
        },
      ]);
      const q = await aiApi.quota(token);
      setQuota(q);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadConversation(id: string) {
    const token = getAccessToken();
    if (!token) return;
    const conv = await aiApi.conversation(token, id);
    setConversationId(id);
    setMessages(conv.messages ?? []);
    setSidebarOpen(false);
  }

  function startNewChat() {
    setConversationId(undefined);
    setMessages([]);
    setSidebarOpen(false);
  }

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
      {quota ? (
        <p className="shrink-0 border-t border-line px-4 py-3 text-xs text-mist">
          {quota.is_unlimited
            ? "Unlimited messages"
            : `${quota.remaining} of ${quota.limit} left today`}
        </p>
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
        {/* Desktop conversation sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col overflow-hidden border-r border-line bg-white lg:flex xl:w-64">
          {conversationSidebar}
        </aside>

        {/* Mobile conversation drawer */}
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

        {/* Chat thread */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {messages.length === 0 ? (
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
                      className="rounded-full border border-line bg-white px-4 py-2.5 text-left text-sm text-ink transition-colors hover:border-sky hover:bg-sky-soft sm:text-center"
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
              <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-coral-warn">{error}</p>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-line bg-white px-4 py-3 sm:px-6 sm:py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="mx-auto flex max-w-2xl gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask where your money went…"
                disabled={loading}
                className="min-w-0 flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()} className="shrink-0 px-4">
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
