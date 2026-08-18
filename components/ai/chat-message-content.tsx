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
            className="inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 font-mono text-xs sm:text-sm font-semibold text-rose-700 my-0.5"
          >
            <TrendingDown className="size-3.5 text-rose-600 shrink-0" />
            {matchText}
          </span>,
        );
      } else {
        elements.push(
          <span
            key={`curr-${matchIndex}`}
            className="inline-block rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 font-mono text-xs sm:text-sm font-semibold text-emerald-700 my-0.5"
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
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-sky-50 text-sky-800 border-sky-200"
          }`}
        >
          {matchText}
        </span>,
      );
    } else if (groups.risk) {
      elements.push(
        <span
          key={`risk-${matchIndex}`}
          className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-xs sm:text-sm font-medium text-amber-800 my-0.5"
        >
          <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
          {matchText}
        </span>,
      );
    } else if (groups.category) {
      elements.push(
        <span
          key={`cat-${matchIndex}`}
          className="font-semibold text-brand underline decoration-sky/50 underline-offset-2"
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
        <strong key={index} className="font-semibold text-ink">
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
          className="flex items-start gap-2.5 text-sm leading-relaxed text-ink"
        >
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky" />
          <div className="flex-1 min-w-0">{processInlineBold(cleanLine, false)}</div>
        </li>,
      );
    } else if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      flushList();
      const headerText = trimmed.replace(/^#{2,3}\s+/, "");
      blocks.push(
        <h4
          key={`head-${lineIdx}`}
          className="mt-3 mb-1.5 font-bold text-ink text-sm sm:text-base tracking-tight"
        >
          {processInlineBold(headerText, false)}
        </h4>,
      );
    } else {
      flushList();
      blocks.push(
        <p key={`p-${lineIdx}`} className="mb-2.5 last:mb-0 text-sm leading-relaxed text-ink">
          {processInlineBold(trimmed, false)}
        </p>,
      );
    }
  });

  flushList();

  return <div className="space-y-1">{blocks}</div>;
}
