import { AuthError } from "@supabase/supabase-js";

export function getSupabaseAuthErrorMessage(error: AuthError): string {
  if (error.message === "Invalid login credentials") {
    return "Invalid email or password.";
  }
  return error.message;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
