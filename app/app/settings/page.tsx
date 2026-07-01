"use client";

import Link from "next/link";
import { AppHeader, PlanBadge } from "@/components/dashboard/app-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";

const settingsLinks = [
  { href: "/app/settings/profile", label: "Profile", description: "Email and plan details" },
  { href: "/app/settings/security", label: "Security", description: "Two-factor authentication" },
  { href: "/app/settings/api-keys", label: "API keys", description: "Advanced plan integrations" },
];

export default function SettingsPage() {
  const { user, plan, logout } = useAuth();

  return (
    <>
      <AppHeader title="Settings" description="Profile, security, and integrations" />

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settingsLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full transition-colors hover:border-sky">
                <CardBody>
                  <h2 className="text-sm font-semibold text-ink">{link.label}</h2>
                  <p className="mt-1 text-sm text-mist">{link.description}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Quick overview</h2>
            <PlanBadge />
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-xs text-mist">Email</p>
              <p className="text-sm font-medium text-ink">{user?.email}</p>
            </div>
            {user?.created_at ? (
              <div>
                <p className="text-xs text-mist">Member since</p>
                <p className="text-sm font-medium text-ink">{formatDate(user.created_at)}</p>
              </div>
            ) : null}
            {plan?.features ? (
              <ul className="mt-2 space-y-1 text-sm">
                {plan.features
                  .filter((f) => f.limit !== null || f.enabled)
                  .slice(0, 6)
                  .map((f) => (
                    <li key={f.name} className="flex justify-between text-mist">
                      <span className="capitalize">{f.name.replace(/_/g, " ")}</span>
                      <span className="text-ink">
                        {f.enabled ? (f.limit == null ? "∞" : f.limit) : "—"}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : null}
            <Button href="/app/upgrade" variant="secondary" className="mt-2">
              Upgrade plan
            </Button>
          </CardBody>
        </Card>

        <Button variant="ghost" className="text-coral-warn" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </>
  );
}
