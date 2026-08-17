"use client";

import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  error?: string | null;
  id?: string;
}

export function FieldError({ error, id }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-coral-warn animate-fadeIn"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}
