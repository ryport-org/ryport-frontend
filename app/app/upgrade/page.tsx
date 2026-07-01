"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { PAYSTACK_PUBLIC_KEY } from "@/lib/config";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    PaystackPop?: new () => {
      newTransaction: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

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
  const { user, plan, refreshSession } = useAuth();
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || document.getElementById("paystack-script")) return;
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    scriptLoaded.current = true;
  }, []);

  function checkout(targetPlan: "pro" | "advanced", amountKobo: number) {
    if (!user || !PAYSTACK_PUBLIC_KEY || !window.PaystackPop) {
      alert("Paystack not configured. Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.");
      return;
    }
    const handler = new window.PaystackPop().newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: amountKobo,
      currency: "NGN",
      metadata: {
        user_id: user.id,
        plan: targetPlan,
        email: user.email,
      },
      onSuccess: () => {
        setTimeout(() => refreshSession(), 3000);
      },
    });
    handler.openIframe();
  }

  const currentPlan = plan?.plan ?? "free";

  return (
    <AppPage>
      <AppHeader
        title="Upgrade"
        description="Choose the plan that fits your needs"
      />

      <AppPageBody>
        <div className="mx-auto w-full max-w-4xl space-y-8 p-6 sm:p-8">
          {currentPlan !== "free" ? (
            <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-mist sm:px-5">
              Current plan:{" "}
              <span className="font-semibold capitalize text-ink">
                {plan?.display_name ?? currentPlan}
              </span>
            </div>
          ) : null}

          <div className="grid items-stretch gap-6 md:grid-cols-2">
            {plans.map((p) => {
              const isCurrent = currentPlan === p.id;
              return (
                <Card
                  key={p.id}
                  className={cn(
                    "flex h-full flex-col",
                    p.highlighted && "border-sky/40 ring-1 ring-sky/20",
                    isCurrent && "border-sky",
                  )}
                >
                  <CardBody className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-ink">{p.name}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-mist">{p.tagline}</p>
                      </div>
                      {p.highlighted ? <Badge variant="sky">Popular</Badge> : null}
                    </div>

                    <p className="mt-6 font-display text-3xl tabular-nums text-ink sm:text-4xl">
                      {formatNaira(p.priceKobo)}
                      <span className="text-base font-normal text-mist">/mo</span>
                    </p>

                    <ul className="mt-6 flex-1 space-y-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                          <Check className="mt-0.5 size-4 shrink-0 text-sky" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="mt-8 w-full"
                      variant={isCurrent ? "secondary" : p.highlighted ? "primary" : "secondary"}
                      disabled={isCurrent}
                      onClick={() => checkout(p.id, p.priceKobo)}
                    >
                      {isCurrent ? "Current plan" : `Upgrade to ${p.name}`}
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-xs text-mist">
            Payments are processed securely via Paystack. Your plan updates automatically after payment.
          </p>
        </div>
      </AppPageBody>
    </AppPage>
  );
}
