"use client";

import Image from "next/image";
import { Share, PlusSquare, X, Download } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";

export function InstallPromptModal() {
  const {
    shouldShowPrompt,
    platform,
    variant,
    benefitCopy,
    promptInstall,
    dismissPrompt,
  } = useInstallPrompt();

  if (!shouldShowPrompt) return null;

  const isBottomSheet = variant === "bottom_sheet";

  return (
    <div
      className={
        isBottomSheet
          ? "fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 transition-all animate-in slide-in-from-bottom-4 duration-300"
          : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in-50 duration-200"
      }
      role="dialog"
      aria-labelledby="pwa-prompt-title"
    >
      <div
        className={
          isBottomSheet
            ? "mx-auto max-w-md w-full rounded-2xl border border-line bg-white p-5 shadow-xl transition-all"
            : "max-w-md w-full rounded-2xl border border-line bg-white p-6 shadow-2xl transition-all"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-paper border border-line">
              <Image
                src="/logo.png"
                alt="Ryport"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <h3
                id="pwa-prompt-title"
                className="text-base font-semibold text-ink"
              >
                {platform === "ios"
                  ? "Add Ryport to your Home Screen"
                  : "Install Ryport App"}
              </h3>
              <p className="mt-0.5 text-xs text-mist">{benefitCopy}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissPrompt}
            className="rounded-lg p-1 text-mist hover:bg-paper hover:text-ink transition-colors"
            aria-label="Not now"
          >
            <X className="size-5" />
          </button>
        </div>

        {platform === "ios" ? (
          <div className="mt-4 space-y-2.5 rounded-xl border border-line bg-paper/60 p-3.5 text-xs text-ink">
            <p className="font-semibold text-ink/90 text-xs">
              Follow these simple steps in Safari:
            </p>
            <ol className="space-y-2">
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-soft font-semibold text-sky text-[11px]">
                  1
                </span>
                <span className="flex-1">
                  Tap the{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-ink bg-white border border-line rounded px-1.5 py-0.5 text-[11px]">
                    <Share className="size-3.5 text-sky inline" /> Share
                  </span>{" "}
                  icon in Safari&apos;s toolbar.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-soft font-semibold text-sky text-[11px]">
                  2
                </span>
                <span className="flex-1">
                  Scroll down and tap{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-ink bg-white border border-line rounded px-1.5 py-0.5 text-[11px]">
                    <PlusSquare className="size-3.5 text-ink inline" /> Add to
                    Home Screen
                  </span>
                  .
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-soft font-semibold text-sky text-[11px]">
                  3
                </span>
                <span className="flex-1">
                  Tap <strong className="font-semibold text-sky">Add</strong> in
                  the top right corner.
                </span>
              </li>
            </ol>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={dismissPrompt}
            className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors"
          >
            Not now
          </button>

          {platform === "ios" ? (
            <button
              type="button"
              onClick={dismissPrompt}
              className="rounded-lg bg-sky px-4 py-2 text-xs font-semibold text-white hover:bg-sky/90 transition-colors"
            >
              Got it
            </button>
          ) : (
            <button
              type="button"
              onClick={promptInstall}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky px-4 py-2 text-xs font-semibold text-white hover:bg-sky/90 transition-colors"
            >
              <Download className="size-3.5" />
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
