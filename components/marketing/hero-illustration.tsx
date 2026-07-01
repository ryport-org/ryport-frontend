"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const aiPrompts = [
  {
    id: "where",
    text: "Where did my money go?",
    reply:
      "Food is 45% of spending — ₦40,000 this month. Transport is next at ₦18,500.",
  },
  {
    id: "biggest",
    text: "What's my biggest expense?",
    reply: "Your top expense is rent at ₦180,000, followed by food at ₦40,000.",
  },
  {
    id: "budget",
    text: "Am I over budget this month?",
    reply: "You're ₦12,400 under your monthly budget with 9 days left.",
  },
];

const defaultChat = {
  question: "Where did my money go this month?",
  reply:
    "Food is 45% of spending — ₦40,000. Transport is next at ₦18,500. You're on track overall.",
};

export function HeroIllustration() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeChat, setActiveChat] = useState(defaultChat);

  const dismissPrompt = (prompt: (typeof aiPrompts)[number]) => {
    setDismissed((prev) => new Set(prev).add(prompt.id));
    setActiveChat({ question: prompt.text, reply: prompt.reply });
  };

  const visiblePrompts = aiPrompts.filter((p) => !dismissed.has(p.id));

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-line/70 bg-white shadow-[0_28px_90px_rgba(19,23,31,0.10)] sm:rounded-3xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-5 border-b border-line px-6 py-5 sm:px-10 sm:py-6">
          <div className="flex shrink-0 gap-2" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#FF5F57]" />
            <span className="size-3 rounded-full bg-[#FEBC2E]" />
            <span className="size-3 rounded-full bg-[#28C840]" />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-white px-5 py-3 shadow-[0_4px_24px_rgba(19,23,31,0.06)] sm:mx-auto sm:max-w-2xl sm:px-6">
            <Search className="size-4 shrink-0 text-mist" aria-hidden="true" />
            <span className="truncate text-sm text-mist">
              How much did I spend on food this month?
            </span>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-medium text-white">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Ask AI
            </span>
          </div>
        </div>

        {/* Canvas — all floating elements live inside here */}
        <div className="relative min-h-[480px] px-6 py-10 pb-44 sm:min-h-[420px] sm:px-12 sm:py-14 sm:pb-36 md:min-h-[460px] md:px-16 md:py-16 md:pb-32">
          {/* Blurred dashboard skeleton */}
          <div
            className="pointer-events-none grid grid-cols-1 gap-10 opacity-[0.28] blur-[1.5px] md:grid-cols-[1.1fr_0.9fr] md:gap-16"
            aria-hidden="true"
          >
            <div className="aspect-[5/4] rounded-2xl bg-line md:aspect-auto md:min-h-[240px]" />
            <div className="flex flex-col justify-center gap-5">
              <div className="h-4 w-3/5 rounded-full bg-line" />
              <div className="h-3 w-full rounded-full bg-line" />
              <div className="h-3 w-11/12 rounded-full bg-line" />
              <div className="h-3 w-4/5 rounded-full bg-line" />
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="h-14 rounded-xl bg-sky-soft" />
                <div className="h-14 rounded-xl bg-line" />
              </div>
            </div>
          </div>

          {/* Active chat — left side */}
          <div className="absolute left-6 top-10 z-20 flex max-w-[calc(100%-3rem)] flex-col gap-4 sm:left-12 sm:top-14 sm:max-w-sm md:left-16 md:top-16 md:max-w-md">
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-sky/15 bg-sky-soft px-5 py-3 shadow-sm">
              <Sparkles className="size-4 shrink-0 text-sky" aria-hidden="true" />
              <span className="text-sm font-medium leading-snug text-ink">
                {activeChat.question}
              </span>
            </div>
            <div className="rounded-2xl border border-line bg-white px-5 py-4 shadow-[0_8px_32px_rgba(19,23,31,0.08)] sm:px-6 sm:py-5">
              <p className="text-sm leading-relaxed text-ink">{activeChat.reply}</p>
            </div>
          </div>

          {/* Suggested prompts — bottom right, stacked with stagger */}
          {visiblePrompts.length > 0 && (
            <div className="absolute right-6 bottom-12 z-20 flex flex-col items-end gap-3 sm:right-12 sm:bottom-14 sm:gap-4 md:right-16 md:bottom-16">
              {visiblePrompts.map((prompt, i) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => dismissPrompt(prompt)}
                  className={cn(
                    "inline-flex max-w-[min(100vw-4rem,260px)] items-center gap-2.5 rounded-full border border-sky/20 bg-sky-soft px-5 py-3 text-left text-sm font-medium text-ink shadow-sm transition-all duration-200",
                    "hover:border-sky/35 hover:bg-white hover:shadow-md",
                    "active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2",
                    i === 1 && "mr-6 sm:mr-10",
                    i === 2 && "mr-12 sm:mr-20",
                  )}
                >
                  <Sparkles className="size-4 shrink-0 text-sky" aria-hidden="true" />
                  <span className="leading-snug">{prompt.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Bottom-left floating bar */}
          <div className="absolute bottom-6 left-6 z-20 max-w-[calc(100%-3rem)] rounded-full border border-line bg-white px-4 py-2.5 shadow-[0_8px_28px_rgba(19,23,31,0.08)] sm:bottom-14 sm:left-12 sm:max-w-none sm:px-6 sm:py-3.5 md:bottom-16 md:left-16">
            <span className="text-sm font-medium text-ink">Transactions</span>
            <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Ask AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
