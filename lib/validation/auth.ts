/**
 * Auth input validation utility functions for Ryport frontend.
 */

// Email regex enforcing user@domain.tld structure with at least 2 char TLD
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Nigerian phone format regex (+234, 234, or 0 followed by 70, 80, 81, 90, 91 and 8 digits)
const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)(?:70|80|81|90|91)\d{8}$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email address is required";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address";
  }
  return null;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordValidationResult {
  valid: boolean;
  strength: PasswordStrength;
  error: string | null;
  rules: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    noSpaces: boolean;
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasSpace = /\s/.test(password);
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const valid = minLength && hasLetter && hasNumber && !hasSpace;

  let error: string | null = null;
  if (!password) {
    error = "Password is required";
  } else if (hasSpace) {
    error = "Password cannot contain spaces";
  } else if (!minLength) {
    error = "Password must be at least 8 characters long";
  } else if (!hasLetter) {
    error = "Password must contain at least one letter";
  } else if (!hasNumber) {
    error = "Password must contain at least one number";
  }

  // Calculate strength
  let strengthScore = 0;
  if (minLength) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (hasLetter) strengthScore++;
  if (hasNumber) strengthScore++;
  if (hasSpecial) strengthScore++;
  if (hasSpace) strengthScore = 0;

  let strength: PasswordStrength = "weak";
  if (strengthScore >= 4 && valid) {
    strength = "strong";
  } else if (strengthScore >= 2 && valid) {
    strength = "medium";
  }

  return {
    valid,
    strength,
    error,
    rules: {
      minLength,
      hasLetter,
      hasNumber,
      noSpaces: !hasSpace,
    },
  };
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return "Phone number is required";
  }
  // Strip spaces, dashes, parentheses for clean check if user formatted with spaces
  const sanitized = trimmed.replace(/[\s()-]/g, "");
  if (!NIGERIAN_PHONE_REGEX.test(sanitized)) {
    return "Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)";
  }
  return null;
}

export function validateName(value: string, fieldName: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return `${fieldName} is required`;
  }
  if (trimmed.length > 50) {
    return `${fieldName} cannot exceed 50 characters`;
  }
  return null;
}
