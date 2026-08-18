"use client";

import React from "react";

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
  "uncategorized",
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
      `(?<risk>none of them have been categorized yet|no income recorded yet|exceeds(?: your spending)?|over budget|over limit|high risk|critical|deficit|outstanding|anomaly|unusual|spending spike|depleted|unpaid)`,
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
            className="font-semibold text-rose-700 font-mono tracking-tight bg-rose-500/10 px-1 py-0.5 rounded-xs"
          >
            {matchText}
          </span>,
        );
      } else {
        elements.push(
          <span
            key={`curr-${matchIndex}`}
            className="font-semibold text-emerald-800 font-mono tracking-tight bg-emerald-500/10 px-1 py-0.5 rounded-xs"
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
          className={`font-semibold font-mono tracking-tight px-1 py-0.5 rounded-xs ${
            isHigh ? "text-amber-900 bg-amber-500/12" : "text-sky-900 bg-sky-500/12"
          }`}
        >
          {matchText}
        </span>,
      );
    } else if (groups.risk) {
      elements.push(
        <span
          key={`risk-${matchIndex}`}
          className="font-medium text-amber-950 bg-amber-500/12 px-1 py-0.5 rounded-xs"
        >
          {matchText}
        </span>,
      );
    } else if (groups.category) {
      elements.push(
        <span
          key={`cat-${matchIndex}`}
          className="font-semibold text-ink underline decoration-sky/40 decoration-2 underline-offset-2"
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
        <ul key={`list-${blocks.length}`} className="my-3 space-y-2 pl-0.5">
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

    const isBullet =
      trimmed.startsWith("• ") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      /^[•\-\*]\s/.test(trimmed);
    const isNumbered = /^\d+\.\s/.test(trimmed);

    if (isBullet || isNumbered) {
      const cleanLine = trimmed.replace(/^([•\-*]|\d+\.)\s+/, "");
      currentListItems.push(
        <li
          key={`li-${lineIdx}`}
          className="flex items-start gap-2.5 text-sm leading-relaxed text-ink"
        >
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky/90" />
          <div className="flex-1 min-w-0">{processInlineBold(cleanLine, false)}</div>
        </li>,
      );
    } else if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      flushList();
      const headerText = trimmed.replace(/^#{2,3}\s+/, "");
      blocks.push(
        <h4
          key={`head-${lineIdx}`}
          className="mt-4 mb-2 font-bold text-ink text-sm sm:text-base tracking-tight"
        >
          {processInlineBold(headerText, false)}
        </h4>,
      );
    } else {
      flushList();
      blocks.push(
        <p key={`p-${lineIdx}`} className="mb-3 last:mb-0 text-sm leading-relaxed text-ink">
          {processInlineBold(trimmed, false)}
        </p>,
      );
    }
  });

  flushList();

  return <div className="space-y-1">{blocks}</div>;
}
