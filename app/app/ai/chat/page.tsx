"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
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
  }

  return (
    <>
      <AppHeader
        title="AI Chat"
        description="Ask anything about your finances in plain English"
        action={
          <Button variant="ghost" onClick={() => router.push("/app/ai")} className="gap-1.5">
            <ArrowLeft className="size-4" /> AI Hub
          </Button>
        }
      />

      <div className="flex h-[calc(100vh-5.5rem)] flex-col lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-line bg-white p-4 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-mist">Conversations</p>
          <ul className="mt-3 space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => loadConversation(c.id)}
                  className={cn(
                    "w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    conversationId === c.id
                      ? "bg-sky-soft text-sky"
                      : "text-mist hover:bg-paper hover:text-ink",
                  )}
                >
                  {c.title ?? "Conversation"}
                </button>
              </li>
            ))}
          </ul>
          {quota ? (
            <p className="mt-6 text-xs text-mist">
              {quota.is_unlimited
                ? "Unlimited messages"
                : `${quota.remaining} of ${quota.limit} left today`}
            </p>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-lg text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-sky-soft">
                  <Sparkles className="size-5 text-sky" />
                </div>
                <h2 className="mt-4 font-display text-xl text-ink">What would you like to know?</h2>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink hover:border-sky hover:bg-sky-soft"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "rounded-br-md bg-ink text-white"
                          : "rounded-bl-md border border-line bg-white text-ink",
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
            {error ? <p className="mt-4 text-center text-sm text-coral-warn">{error}</p> : null}
          </div>

          <div className="border-t border-line bg-white p-4 sm:p-6">
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
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
