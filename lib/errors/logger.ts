import { ApiError } from "@/lib/api/client";

export interface ErrorLogDetails {
  code?: string;
  status?: number;
  requestId?: string;
  endpoint?: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export function logAuthError(error: unknown, endpoint?: string, extraContext?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  let code = "unknown_error";
  let status = 0;
  let requestId = "N/A";
  let message = "Unknown error";
  let details: Record<string, unknown> | undefined;

  if (error instanceof ApiError) {
    code = error.code;
    status = error.status;
    requestId = error.requestId || "N/A";
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const logPayload: ErrorLogDetails = {
    code,
    status,
    requestId,
    endpoint,
    timestamp,
    context: {
      message,
      details,
      ...extraContext,
    },
  };

  // Development environment logging
  if (process.env.NODE_ENV !== "production") {
    console.error("[AuthErrorLog]", JSON.stringify(logPayload, null, 2), error);
  }

  // Production Sentry integration (guarded check)
  if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: Function } }).Sentry) {
    const Sentry = (window as unknown as { Sentry: { captureException: Function; setTag: Function; setContext: Function } }).Sentry;
    if (requestId !== "N/A") {
      Sentry.setTag("request_id", requestId);
    }
    if (code) {
      Sentry.setTag("error_code", code);
    }
    Sentry.setContext("auth_error_details", logPayload as unknown as Record<string, unknown>);
    Sentry.captureException(error);
  }
}
