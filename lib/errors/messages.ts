import { ApiError } from "@/lib/api/client";

const ERROR_MESSAGE_MAP: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  email_already_exists: "An account with this email already exists.",
  rate_limited: "Too many attempts. Try again in a few minutes.",
  network_error: "Can't reach Ryport right now. Check your connection and try again.",
  not_authenticated: "Your session has expired. Please log in again.",
  quota_exceeded: "You have reached your limit for this feature.",
  feature_not_available: "This feature is not available on your current plan.",
};

export interface FormattedError {
  message: string;
  fieldErrors?: Record<string, string>;
  isNetworkError?: boolean;
  isRateLimited?: boolean;
  isServerError?: boolean;
  isAuthError?: boolean;
  requestId?: string;
  status?: number;
}

export function getErrorMessage(error: unknown): FormattedError {
  if (error instanceof ApiError) {
    const status = error.status;
    const code = error.code;
    const requestId = error.requestId;

    // Handle 401 Unauthorized
    if (status === 401 || code === "invalid_credentials") {
      return {
        message: ERROR_MESSAGE_MAP.invalid_credentials,
        isAuthError: true,
        requestId,
        status,
      };
    }

    // Handle 429 Rate Limited
    if (status === 429 || code === "rate_limited") {
      return {
        message: ERROR_MESSAGE_MAP.rate_limited,
        isRateLimited: true,
        requestId,
        status,
      };
    }

    // Handle 5xx Server Error
    if (status >= 500) {
      return {
        message: "Something went wrong on our end. Please try again shortly.",
        isServerError: true,
        requestId,
        status,
      };
    }

    // Handle 400 Validation Errors with field details
    if (code === "validation_error" || (error.details && typeof error.details === "object")) {
      const fieldErrors: Record<string, string> = {};
      if (error.details && typeof error.details === "object") {
        for (const [key, val] of Object.entries(error.details)) {
          if (Array.isArray(val) && val.length > 0) {
            fieldErrors[key] = String(val[0]);
          } else if (typeof val === "string") {
            fieldErrors[key] = val;
          }
        }
      }
      return {
        message: error.message || "Please fix the highlighted errors below.",
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        requestId,
        status,
      };
    }

    // Handle mapped error codes
    if (code in ERROR_MESSAGE_MAP) {
      return {
        message: ERROR_MESSAGE_MAP[code],
        requestId,
        status,
      };
    }

    // Safe fallback for other backend errors (avoid technical traces)
    const isTechnical =
      error.message.includes("Traceback") ||
      error.message.includes("Exception") ||
      error.message.includes("SQL") ||
      error.message.includes("Internal Server");

    return {
      message: isTechnical
        ? "An unexpected error occurred. Please try again."
        : error.message || "An error occurred while processing your request.",
      requestId,
      status,
    };
  }

  // Network / Fetch failure or TypeErrors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: ERROR_MESSAGE_MAP.network_error,
      isNetworkError: true,
    };
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.toLowerCase().includes("network")) {
      return {
        message: ERROR_MESSAGE_MAP.network_error,
        isNetworkError: true,
      };
    }
  }

  return {
    message: "An unexpected error occurred. Please try again.",
  };
}
