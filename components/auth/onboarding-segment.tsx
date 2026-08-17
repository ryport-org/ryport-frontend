"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Building2, Check, ArrowRight } from "lucide-react";
import { FormBanner } from "@/components/auth/form-banner";
import { useAuth } from "@/lib/auth/auth-context";
import { usersApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/tokens";
import { getErrorMessage, type FormattedError } from "@/lib/errors/messages";
import { logAuthError } from "@/lib/errors/logger";
import type { UserSegment } from "@/lib/api/types";

interface SegmentOption {
  id: UserSegment;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof User;
}

const SEGMENT_OPTIONS: SegmentOption[] = [
  {
    id: "individual",
    title: "Just me",
    subtitle: "Personal finance",
    description: "Track personal expenses, manage budgets, link bank accounts, and get AI insights.",
    icon: User,
  },
  {
    id: "freelancer",
    title: "Freelance or solo work",
    subtitle: "Solo creator / Contractor",
    description: "Separate personal & work cash flow, track invoices, monitor income, and optimize taxes.",
    icon: Briefcase,
  },
  {
    id: "sme",
    title: "I run a business",
    subtitle: "SME / Registered Company",
    description: "Manage business accounts, cash flow forecasting, multi-user teams, and CFO reports.",
    icon: Building2,
  },
];

export function OnboardingSegmentForm() {
  const router = useRouter();
  const { bootstrap } = useAuth();
  const [selectedSegment, setSelectedSegment] = useState<UserSegment | null>(null);
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState<FormattedError | null>(null);

  async function handleProceed(segment: UserSegment) {
    setSelectedSegment(segment);
    setLoading(true);
    setBannerError(null);

    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Call PATCH /api/v1/users/me/segment/
      await usersApi.updateSegment(token, segment);

      if (segment === "sme") {
        // Proceed to Step 3: Business creation
        router.push("/onboarding/business");
      } else {
        // Individual / Freelancer -> bootstrap and proceed directly to Step 4 (dashboard)
        await bootstrap(token);
        router.push("/app/dashboard");
      }
    } catch (err) {
      logAuthError(err, "/users/me/segment/");
      setBannerError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center sm:text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky">Step 2 of 3</span>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">What brings you to Ryport?</h1>
        <p className="mt-2 text-sm text-mist">
          Choose the path that best describes your needs. We&apos;ll tailor your dashboard and AI insights accordingly.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <FormBanner error={bannerError} onRetry={() => selectedSegment && handleProceed(selectedSegment)} />

        {SEGMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedSegment === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={loading}
              onClick={() => handleProceed(opt.id)}
              className={`group relative flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky/20 ${
                isSelected
                  ? "border-sky bg-sky-soft/40 shadow-sm"
                  : "border-line bg-white hover:border-sky/50 hover:bg-paper"
              }`}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isSelected
                    ? "bg-sky text-white"
                    : "bg-paper text-ink group-hover:bg-sky-soft group-hover:text-sky"
                }`}
              >
                <Icon className="size-5" />
              </div>

              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink text-base">{opt.title}</h3>
                  <span className="rounded bg-line/60 px-2 py-0.5 text-[11px] font-medium text-mist">
                    {opt.subtitle}
                  </span>
                </div>
                <p className="mt-1 text-xs text-mist leading-relaxed">{opt.description}</p>
              </div>

              <div className="absolute right-5 top-5">
                {isSelected && loading ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-sky/30 border-t-sky" />
                ) : isSelected ? (
                  <div className="flex size-6 items-center justify-center rounded-full bg-sky text-white">
                    <Check className="size-3.5" />
                  </div>
                ) : (
                  <ArrowRight className="size-4 text-mist opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
