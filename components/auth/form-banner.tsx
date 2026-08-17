"use client";

import { AlertTriangle, RefreshCw, ServerCrash, WifiOff } from "lucide-react";
import type { FormattedError } from "@/lib/errors/messages";

interface FormBannerProps {
  error: FormattedError | null;
  onRetry?: () => void;
}

export function FormBanner({ error, onRetry }: FormBannerProps) {
  if (!error || !error.message) return null;

  const { message, fieldErrors, isNetworkError, isRateLimited, isServerError, requestId } = error;

  let bgClass = "bg-coral-warn/10 border-coral-warn/30 text-coral-warn";
  let Icon = AlertTriangle;

  if (isNetworkError) {
    bgClass = "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
    Icon = WifiOff;
  } else if (isServerError) {
    bgClass = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
    Icon = ServerCrash;
  } else if (isRateLimited) {
    bgClass = "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400";
    Icon = AlertTriangle;
  }

  const detailsList = fieldErrors ? Object.entries(fieldErrors) : [];

  return (
    <div
      className={`rounded-lg border p-3.5 text-sm transition-all ${bgClass}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0" />
        <div className="flex-1">
          <p className="font-medium leading-snug">{message}</p>
          {detailsList.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-xs opacity-90">
              {detailsList.map(([key, val]) => (
                <li key={key} className="capitalize">
                  • <span className="font-semibold">{key.replace(/_/g, " ")}:</span> {val}
                </li>
              ))}
            </ul>
          )}
          {requestId && (
            <p className="mt-1 font-mono text-[11px] opacity-75">
              Support ID: <span className="select-all font-semibold">{requestId}</span>
            </p>
          )}
        </div>
        {isNetworkError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 rounded bg-white/80 px-2.5 py-1 text-xs font-semibold shadow-xs hover:bg-white active:scale-95 transition-all text-ink"
          >
            <RefreshCw className="size-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
