"use client";

import React from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";

const CATEGORIES = [
  "other",
  "health",
  "transport",
  "utilities",
  "groceries",
  "food",
  "shopping",
  "business",
  "healthcare",
  "entertainment",
  "education",
  "uncategorised",
  "rent",
  "fuel",
  "airtime",
  "payroll",
  "dining",
];

export function parseInlineTokens(text: string, isUserMessage = false): React.ReactNode[] {
  if (isUserMessage) {
    return [text];
  }

  const combinedRegex = new RegExp(
    [
      `(?<currency>-?[₦$€£]\\s*[\\d,]+(?:\\.\\d+)?)`,
      `(?<percent>(?:≈\\s*)?\\d+(?:\\.\\d+)?\\s*%\\s*(?:used|budget|spent)?)`,
      `(?<risk>no income recorded yet|exceeds(?: your spending)?|over budget|over limit|high risk|critical|deficit|outstanding|anomaly|unusual|spending spike|depleted|unpaid)`,
      `(?<category>\\b(?:${CATEGORIES.join("|")})\\b)`,
    ].join("|"),
    "gi",
  );

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];

    if (matchIndex > lastIndex) {
      elements.push(text.substring(lastIndex, matchIndex));
    }

    const groups = match.groups || {};

    if (groups.currency) {
      const isNegative = matchText.startsWith("-");
      if (isNegative) {
        elements.push(
          <span
            key={`curr-${matchIndex}`}
            className="inline-flex items-center gap-1 rounded bg-rose-500/20 border border-rose-500/35 px-1.5 py-0.5 font-mono text-xs sm:text-sm font-semibold text-rose-300 shadow-sm my-0.5"
          >
            <TrendingDown className="size-3.5 text-rose-400 shrink-0" />
            {matchText}
          </span>,
        );
      } else {
        elements.push(
          <span
            key={`curr-${matchIndex}`}
            className="inline-block rounded bg-emerald-500/20 border border-emerald-500/35 px-1.5 py-0.5 font-mono text-xs sm:text-sm font-semibold text-emerald-300 shadow-sm my-0.5"
          >
            {matchText}
          </span>,
        );
      }
    } else if (groups.percent) {
      const numMatch = matchText.match(/\d+/);
      const val = numMatch ? parseInt(numMatch[0], 10) : 0;
      const isHigh = val >= 75;
      elements.push(
        <span
          key={`pct-${matchIndex}`}
          className={`inline-block rounded px-1.5 py-0.5 font-mono text-xs sm:text-sm font-semibold border my-0.5 ${
            isHigh
              ? "bg-amber-500/25 text-amber-300 border-amber-500/40"
              : "bg-sky-500/20 text-sky-300 border-sky-500/35"
          }`}
        >
          {matchText}
        </span>,
      );
    } else if (groups.risk) {
      elements.push(
        <span
          key={`risk-${matchIndex}`}
          className="inline-flex items-center gap-1 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-xs sm:text-sm font-medium text-amber-300 shadow-sm my-0.5"
        >
          <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
          {matchText}
        </span>,
      );
    } else if (groups.category) {
      elements.push(
        <span
          key={`cat-${matchIndex}`}
          className="font-semibold text-sky-300 underline decoration-sky-400/60 decoration-2 underline-offset-2"
        >
          {matchText}
        </span>,
      );
    } else {
      elements.push(matchText);
    }

    lastIndex = combinedRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
}

function processInlineBold(text: string, isUserMessage: boolean): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const innerText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-zinc-100">
          {parseInlineTokens(innerText, isUserMessage)}
        </strong>
      );
    }
    return <React.Fragment key={index}>{parseInlineTokens(part, isUserMessage)}</React.Fragment>;
  });
}

export function ChatMessageContent({
  content,
  role = "assistant",
}: {
  content: string;
  role?: "user" | "assistant";
}) {
  const isUser = role === "user";

  if (isUser) {
    return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
  }

  // Parse into blocks (paragraphs, bullet lists, headers)
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="my-2.5 space-y-2 pl-1">
          {currentListItems}
        </ul>,
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const isNumbered = /^\d+\.\s/.test(trimmed);

    if (isBullet || isNumbered) {
      const cleanLine = trimmed.replace(/^([-*]|\d+\.)\s+/, "");
      currentListItems.push(
        <li
          key={`li-${lineIdx}`}
          className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-200"
        >
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-sky-400/80 shadow-sm" />
          <div className="flex-1 min-w-0">{processInlineBold(cleanLine, false)}</div>
        </li>,
      );
    } else if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      flushList();
      const headerText = trimmed.replace(/^#{2,3}\s+/, "");
      blocks.push(
        <h4
          key={`head-${lineIdx}`}
          className="mt-3 mb-1.5 font-bold text-zinc-100 text-sm sm:text-base tracking-tight"
        >
          {processInlineBold(headerText, false)}
        </h4>,
      );
    } else {
      flushList();
      blocks.push(
        <p key={`p-${lineIdx}`} className="mb-2.5 last:mb-0 text-sm leading-relaxed text-zinc-200">
          {processInlineBold(trimmed, false)}
        </p>,
      );
    }
  });

  flushList();

  return <div className="space-y-1">{blocks}</div>;
}
