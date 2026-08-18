import { describe, expect, test } from "vitest";
import React from "react";
import { parseInlineTokens, ChatMessageContent } from "@/components/ai/chat-message-content";

describe("ChatMessageContent & Keyword Highlighting", () => {
  test("parseInlineTokens identifies currency tokens", () => {
    const tokens = parseInlineTokens("Total spent: ₦91,519.99", false);
    expect(tokens.length).toBeGreaterThan(1);

    const hasCurrency = tokens.some((t) => {
      if (React.isValidElement<{ children?: React.ReactNode }>(t)) {
        return String(t.props.children).includes("₦91,519.99");
      }
      return false;
    });
    expect(hasCurrency).toBe(true);
  });

  test("parseInlineTokens identifies negative currency tokens as rose/warning", () => {
    const tokens = parseInlineTokens("Net balance: -₦91,519.99", false);
    const hasNegative = tokens.some((t) => {
      if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(t)) {
        const className = t.props.className || "";
        return className.includes("rose") && String(t.props.children).includes("-₦91,519.99");
      }
      return false;
    });
    expect(hasNegative).toBe(true);
  });

  test("parseInlineTokens identifies percentage usage tokens", () => {
    const tokens = parseInlineTokens("Monthly budget: ₦100,000 (≈ 92 % used)", false);
    const hasPercent = tokens.some((t) => {
      if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(t)) {
        const className = t.props.className || "";
        return className.includes("amber") && String(t.props.children).includes("92 % used");
      }
      return false;
    });
    expect(hasPercent).toBe(true);
  });

  test("parseInlineTokens identifies risk phrases", () => {
    const tokens = parseInlineTokens("Net balance: -₦91,519.99 (no income recorded yet)", false);
    const hasRisk = tokens.some((t) => {
      if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(t)) {
        const className = t.props.className || "";
        return className.includes("amber") && String(t.props.children).includes("no income recorded yet");
      }
      return false;
    });
    expect(hasRisk).toBe(true);
  });

  test("parseInlineTokens identifies financial categories", () => {
    const tokens = parseInlineTokens("You spent the most in the other category with health and transport.", false);
    const hasCategory = tokens.some((t) => {
      if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(t)) {
        const className = t.props.className || "";
        return className.includes("sky") && String(t.props.children).includes("other");
      }
      return false;
    });
    expect(hasCategory).toBe(true);
  });

  test("ChatMessageContent exports valid component function", () => {
    expect(typeof ChatMessageContent).toBe("function");
    const elem = ChatMessageContent({ content: "Test content", role: "assistant" });
    expect(React.isValidElement(elem)).toBe(true);
  });
});
