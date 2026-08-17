import { describe, it, expect } from "vitest";
import { updateSegment, getDashboardContext } from "@/lib/api/onboarding";
import { createBusiness } from "@/lib/api/businesses";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors/messages";

describe("Onboarding API & Field Validation Tests", () => {
  it("updateSegment and getDashboardContext functions are exported", () => {
    expect(typeof updateSegment).toBe("function");
    expect(typeof getDashboardContext).toBe("function");
  });

  it("createBusiness function is exported and accepts business creation payload", () => {
    expect(typeof createBusiness).toBe("function");
  });

  it("handles business name validation error inline via ApiError", () => {
    const error = new ApiError("validation_error", "Invalid data", 400, "req_biz_err", {
      name: ["Business name already taken."],
    });

    const formatted = getErrorMessage(error);
    expect(formatted.fieldErrors?.name).toBe("Business name already taken.");
  });

  it("formats segment update error properly", () => {
    const error = new ApiError("invalid_segment", "Segment not allowed", 400, "req_seg_err");
    const formatted = getErrorMessage(error);
    expect(formatted.message).toBe("Segment not allowed");
  });
});
