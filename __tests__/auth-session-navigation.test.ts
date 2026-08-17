import { describe, it, expect } from "vitest";
import { isStaffAppPath } from "@/lib/staff/routes";

describe("AuthProvider Persistent Shell Navigation Logic", () => {
  it("correctly evaluates staff app paths for session scoping", () => {
    expect(isStaffAppPath("/app/dashboard")).toBe(false);
    expect(isStaffAppPath("/app/transactions")).toBe(false);
    expect(isStaffAppPath("/app/accounts")).toBe(false);
    expect(isStaffAppPath("/app/budgets")).toBe(false);
    expect(isStaffAppPath("/staff")).toBe(true);
    expect(isStaffAppPath("/staff/dashboard")).toBe(true);
  });
});
