"use client";

import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppHeader, PlanBadge } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";

export default function ProfileSettingsPage() {
  const { user } = useAuth();

  return (
    <AppPage>
      <AppHeader title="Profile" description="Your account details" />

      <AppPageBody>
      <div className="p-6 sm:p-8">
        <Card>
          <CardBody className="space-y-4">
            <div>
              <p className="text-xs text-mist">Email</p>
              <p className="text-sm font-medium text-ink">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-mist">Plan</p>
              <PlanBadge />
            </div>
            {user?.created_at ? (
              <div>
                <p className="text-xs text-mist">Member since</p>
                <p className="text-sm text-ink">{formatDate(user.created_at)}</p>
              </div>
            ) : null}
            {user?.last_login_ip ? (
              <div>
                <p className="text-xs text-mist">Last login IP</p>
                <p className="text-sm text-ink">{user.last_login_ip}</p>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
          </AppPageBody>
    </AppPage>  );
}
