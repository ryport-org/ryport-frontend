"use client";

import { useEffect, useRef } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { PAYSTACK_PUBLIC_KEY } from "@/lib/config";
import { formatNaira } from "@/lib/format";

declare global {
  interface Window {
    PaystackPop?: new () => {
      newTransaction: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

const plans = [
  { id: "pro", name: "Pro", priceKobo: 500_000, features: ["Unlimited AI", "Cash flow", "Exports"] },
  { id: "advanced", name: "Advanced", priceKobo: 1_500_000, features: ["AI CFO", "Multi-business", "Teams", "API keys"] },
] as const;

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

  return (
    <>
      <AppHeader title="Upgrade" description="Choose the plan that fits your needs" />
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8 lg:max-w-3xl">
        {plans.map((p) => {
          const isCurrent = plan?.plan === p.id;
          return (
            <Card key={p.id} className={isCurrent ? "border-sky" : ""}>
              <CardBody>
                <h2 className="text-lg font-semibold text-ink">{p.name}</h2>
                <p className="mt-2 font-display text-3xl text-ink">
                  {formatNaira(p.priceKobo)}
                  <span className="text-sm font-normal text-mist">/mo</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-mist">
                  {p.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={isCurrent ? "secondary" : "primary"}
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
    </>
  );
}
