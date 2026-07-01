"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Wallet, BarChart3 } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth/tokens";
import { aiApi } from "@/lib/api";
import type { AIQuota } from "@/lib/api/types";

const features = [
  {
    href: "/app/ai/chat",
    title: "AI Chat",
    description: "Ask questions about your spending in plain English.",
    icon: Sparkles,
    feature: "ai_chat",
  },
  {
    href: "/app/ai/cash-flow",
    title: "Cash flow forecast",
    description: "30-day projection and runway warnings.",
    icon: TrendingUp,
    feature: "cash_flow_prediction",
  },
  {
    href: "/app/ai/subscriptions",
    title: "Subscriptions",
    description: "Detect recurring charges and duplicates.",
    icon: Wallet,
    feature: "cash_flow_prediction",
  },
  {
    href: "/app/ai/budgets",
    title: "Smart budgets",
    description: "AI-recommended limits based on your habits.",
    icon: BarChart3,
    feature: "cash_flow_prediction",
  },
  {
    href: "/app/ai/cfo",
    title: "AI CFO",
    description: "Executive health score, runway, and cost savings.",
    icon: BarChart3,
    feature: "ai_cfo",
  },
];

export default function AiHubPage() {
  const { canUse } = useAuth();
  const [quota, setQuota] = useState<AIQuota | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    aiApi.quota(token).then(setQuota).catch(() => null);
  }, []);

  return (
    <>
      <AppHeader
        title="AI Hub"
        description="Intelligent tools for your money"
      />

      <div className="space-y-6 p-6 sm:p-8">
        {quota && !quota.is_unlimited ? (
          <Card className="border-sky/20 bg-sky-soft/30">
            <CardBody className="flex items-center justify-between gap-4 py-4">
              <p className="text-sm text-ink">
                <span className="font-semibold">{quota.remaining}</span> AI messages left today
              </p>
              <Link href="/app/upgrade" className="text-sm font-semibold text-sky hover:underline">
                Upgrade for unlimited
              </Link>
            </CardBody>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => {
            const enabled = canUse(f.feature);
            const Icon = f.icon;
            return (
              <Card key={f.href} className={!enabled ? "opacity-60" : ""}>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-soft">
                      <Icon className="size-5 text-sky" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold text-ink">{f.title}</h2>
                      <p className="mt-1 text-sm text-mist">{f.description}</p>
                      {enabled ? (
                        <Link
                          href={f.href}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline"
                        >
                          Open <ArrowRight className="size-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href="/app/upgrade"
                          className="mt-3 inline-flex text-sm font-semibold text-brand hover:underline"
                        >
                          Upgrade to unlock
                        </Link>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
