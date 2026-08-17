import { describe, it, expect } from "vitest";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors/messages";

describe("API Error Mapping & Security Handling", () => {
  it("should map 401 invalid_credentials to generic message and NEVER reveal which field was wrong", () => {
    const error = new ApiError(
      "invalid_credentials",
      "Invalid username or password on server",
      401,
      "req_123"
    );
    const result = getErrorMessage(error);
    expect(result.message).toBe("Incorrect email or password.");
    expect(result.isAuthError).toBe(true);
    expect(result.message).not.toContain("password for user");
    expect(result.message).not.toContain("user not found");
  });

  it("should map 429 rate_limited cleanly", () => {
    const error = new ApiError("rate_limited", "Too many attempts", 429, "req_456");
    const result = getErrorMessage(error);
    expect(result.message).toBe("Too many attempts. Try again in a few minutes.");
    expect(result.isRateLimited).toBe(true);
  });

  it("should handle 5xx server errors with generic text and surface request_id for support", () => {
    const error = new ApiError(
      "internal_server_error",
      "Database connection failed at /var/django/db.py line 42",
      500,
      "req_support_789"
    );
    const result = getErrorMessage(error);
    expect(result.message).toBe("Something went wrong on our end. Please try again shortly.");
    expect(result.isServerError).toBe(true);
    expect(result.requestId).toBe("req_support_789");
    expect(result.message).not.toContain("Database");
    expect(result.message).not.toContain("django");
  });

  it("should format field-specific validation errors for 400 responses", () => {
    const error = new ApiError(
      "validation_error",
      "Invalid data submitted",
      400,
      "req_val_101",
      {
        email: ["An account with this email already exists."],
        phone_number: ["Enter a valid Nigerian phone number."],
      }
    );
    const result = getErrorMessage(error);
    expect(result.fieldErrors?.email).toBe("An account with this email already exists.");
    expect(result.fieldErrors?.phone_number).toBe("Enter a valid Nigerian phone number.");
  });

  it("should handle network failure gracefully", () => {
    const error = new TypeError("Failed to fetch");
    const result = getErrorMessage(error);
    expect(result.message).toBe("Can't reach Ryport right now. Check your connection and try again.");
    expect(result.isNetworkError).toBe(true);
  });
});
