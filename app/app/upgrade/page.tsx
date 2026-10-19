"use client";

import { Check, Sparkles, Clock } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "pro" as const,
    name: "Pro",
    priceKobo: 500_000,
    tagline: "For power users who want unlimited AI and exports.",
    features: ["Unlimited AI chat", "Cash flow forecast", "Report exports", "Receipt scanner"],
  },
  {
    id: "advanced" as const,
    name: "Advanced",
    priceKobo: 1_500_000,
    tagline: "For businesses that need CFO insights and teams.",
    features: ["Everything in Pro", "AI CFO dashboard", "Multi-business", "Team collaboration", "API keys"],
    highlighted: true,
  },
];

export default function UpgradePage() {
  const { plan } = useAuth();
  const currentPlan = plan?.plan ?? "free";

  return (
    <AppPage>
      <AppHeader
        title="Plans & Upgrades"
        description="Subscription plans and feature upgrades"
      />

      <AppPageBody>
        <AppPageContent className="max-w-4xl space-y-8">
          {/* Unlocked Notice Banner */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-sky/30 bg-sky-soft/40 p-4 sm:p-5">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-sky" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">All Features Currently Unlocked</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Active
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-mist sm:text-sm">
                Every account currently has 100% full access to all features at no charge — including Unlimited AI Chat &amp; CFO, Cash Flow Prediction, Debts &amp; Receivables (&ldquo;Who Owes Me&rdquo;), Staff Payroll &amp; Payslips, and Report Exports. Paid tier upgrades are coming soon.
              </p>
            </div>
          </div>

          {currentPlan ? (
            <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm text-mist sm:px-5">
              <span>
                Account status:{" "}
                <span className="font-semibold capitalize text-ink">
                  Full Access (Free Preview)
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mist">
                <Clock className="size-3.5" /> Upgrades Coming Soon
              </span>
            </div>
          ) : null}

          {/* Grayed-out Plan Cards */}
          <div className="grid items-stretch gap-6 opacity-60 grayscale-[0.2] select-none md:grid-cols-2">
            {plans.map((p) => {
              return (
                <Card
                  key={p.id}
                  className={cn(
                    "flex h-full flex-col border-line/80 bg-paper/40",
                    p.highlighted && "border-line ring-1 ring-line/50",
                  )}
                >
                  <CardBody className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-ink/80">{p.name}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-mist">{p.tagline}</p>
                      </div>
                      <Badge variant="default">Coming Soon</Badge>
                    </div>

                    <p className="mt-6 font-display text-3xl tabular-nums text-ink/70 sm:text-4xl">
                      {formatNaira(p.priceKobo)}
                      <span className="text-base font-normal text-mist">/mo</span>
                    </p>

                    <ul className="mt-6 flex-1 space-y-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                          <Check className="mt-0.5 size-4 shrink-0 text-mist" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Grayed-out Coming Soon Button */}
                    <Button
                      className="mt-8 w-full cursor-not-allowed bg-line/80 text-mist hover:bg-line/80"
                      variant="secondary"
                      disabled
                    >
                      Coming soon
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-xs text-mist">
            Billing management and custom subscriptions will be enabled in a future release.
          </p>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
