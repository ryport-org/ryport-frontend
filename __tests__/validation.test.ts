import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateName,
} from "@/lib/validation/auth";

describe("Validation logic", () => {
  describe("Email validation", () => {
    it("should reject 'iii.com' immediately as an invalid format", () => {
      expect(validateEmail("iii.com")).toBe("Enter a valid email address");
    });

    it("should reject missing local part or missing domain", () => {
      expect(validateEmail("@domain.com")).toBe("Enter a valid email address");
      expect(validateEmail("user@")).toBe("Enter a valid email address");
      expect(validateEmail("user@domain")).toBe("Enter a valid email address");
    });

    it("should accept valid email addresses", () => {
      expect(validateEmail("user@company.com")).toBeNull();
      expect(validateEmail("john.doe@sub.domain.co.ng")).toBeNull();
    });

    it("should reject empty or whitespace-only emails", () => {
      expect(validateEmail("")).toBe("Email address is required");
      expect(validateEmail("   ")).toBe("Email address is required");
    });
  });

  describe("Password validation", () => {
    it("should reject passwords that are made entirely of whitespace", () => {
      const res = validatePassword("        ");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Password cannot contain spaces");
    });

    it("should reject passwords containing spaces", () => {
      const res = validatePassword("Password 123");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Password cannot contain spaces");
      expect(res.rules.noSpaces).toBe(false);
    });

    it("should reject passwords shorter than 8 characters", () => {
      const res = validatePassword("Pass1");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Password must be at least 8 characters long");
    });

    it("should reject passwords without at least one number", () => {
      const res = validatePassword("PasswordOnly");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Password must contain at least one number");
    });

    it("should reject passwords without at least one letter", () => {
      const res = validatePassword("123456789");
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Password must contain at least one letter");
    });

    it("should accept strong, valid passwords", () => {
      const res = validatePassword("SecureP@ssword123");
      expect(res.valid).toBe(true);
      expect(res.error).toBeNull();
      expect(res.strength).toBe("strong");
    });
  });

  describe("Confirm Password validation", () => {
    it("should reject mismatch between password and confirm password", () => {
      expect(validateConfirmPassword("Password123", "Password124")).toBe(
        "Passwords do not match"
      );
    });

    it("should accept matching passwords", () => {
      expect(validateConfirmPassword("Password123", "Password123")).toBeNull();
    });
  });

  describe("Nigerian Phone validation", () => {
    it("should accept valid Nigerian phone formats (080..., +234..., 234...)", () => {
      expect(validatePhone("08012345678")).toBeNull();
      expect(validatePhone("+2348012345678")).toBeNull();
      expect(validatePhone("2348012345678")).toBeNull();
      expect(validatePhone("09098765432")).toBeNull();
      expect(validatePhone("07011223344")).toBeNull();
    });

    it("should reject invalid phone formats", () => {
      expect(validatePhone("12345")).toBe(
        "Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)"
      );
      expect(validatePhone("06012345678")).toBe(
        "Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)"
      );
    });
  });

  describe("Name validation", () => {
    it("should reject empty or whitespace-only names", () => {
      expect(validateName("", "First name")).toBe("First name is required");
      expect(validateName("   ", "Last name")).toBe("Last name is required");
    });

    it("should accept valid names", () => {
      expect(validateName("Amina", "First name")).toBeNull();
      expect(validateName("Okafor", "Last name")).toBeNull();
    });
  });
});
