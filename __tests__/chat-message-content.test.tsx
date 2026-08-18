import { describe, expect, test } from "vitest";
import React from "react";
import { parseInlineTokens, ChatMessageContent } from "@/components/ai/chat-message-content";

describe("ChatMessageContent & Natural Highlighting", () => {
  test("parseInlineTokens identifies currency tokens in sample prompt", () => {
    const tokens = parseInlineTokens(
      "Currently, all of your recorded expenses total ₦40,000,000, but none of them have been categorized yet.",
      false
    );
    expect(tokens.length).toBeGreaterThan(1);

    const hasCurrency = tokens.some((t) => {
      if (React.isValidElement<{ children?: React.ReactNode }>(t)) {
        return String(t.props.children).includes("₦40,000,000");
      }
      return false;
    });
    expect(hasCurrency).toBe(true);
  });

  test("parseInlineTokens identifies uncategorized risk phrase naturally", () => {
    const tokens = parseInlineTokens(
      "Currently, all of your recorded expenses total ₦40,000,000, but none of them have been categorized yet.",
      false
    );
    const hasRisk = tokens.some((t) => {
      if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(t)) {
        const className = t.props.className || "";
        return className.includes("amber") && String(t.props.children).includes("none of them have been categorized yet");
      }
      return false;
    });
    expect(hasRisk).toBe(true);
  });

  test("ChatMessageContent parses bullet lists starting with unicode bullet •", () => {
    const sample = `Once your transactions are categorized, I'll be able to identify:

• Your largest spending category
• Monthly spending trends
• Category breakdowns
• Opportunities to save`;

    const elem = ChatMessageContent({ content: sample, role: "assistant" });
    expect(React.isValidElement(elem)).toBe(true);
  });
});
