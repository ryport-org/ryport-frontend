import { describe, it, expect } from "vitest";
import { formatKobo } from "@/lib/format";

describe("New Features & Formats", () => {
  it("formats kobo amounts correctly into Nigerian Naira (NGN)", () => {
    // 500,000 kobo = N5,000.00
    const formatted = formatKobo(500000);
    expect(formatted).toContain("5,000.00");

    // 25,000,000 kobo = N250,000.00
    const largeAmount = formatKobo(25000000);
    expect(largeAmount).toContain("250,000.00");

    // 0 kobo = N0.00
    const zero = formatKobo(0);
    expect(zero).toContain("0.00");
  });
});
