"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PersonalDashboard } from "@/components/dashboard/personal/personal-dashboard";
import { SmeDashboard } from "@/components/dashboard/sme/sme-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeBusiness, dashboardContext, isLoading } = useAuth();

  const segment = dashboardContext?.segment ?? user?.segment ?? null;
  const planTier = dashboardContext?.plan_tier ?? user?.plan ?? "free";

  useEffect(() => {
    if (!isLoading && user) {
      // If user has not completed segment onboarding and has no active business, route to onboarding segment
      if (!segment && !activeBusiness) {
        router.replace("/onboarding/segment");
      }
    }
  }, [isLoading, user, segment, activeBusiness, router]);

  return (
    <AppPage>
      <AppHeader
        title={activeBusiness ? `${activeBusiness.name} Dashboard` : "Personal Dashboard"}
        description={
          activeBusiness
            ? "Enterprise analytics, runway tracking, and team cash flow"
            : "Your financial overview, budgets, and AI insights"
        }
      />

      <AppPageBody>
        <AppPageContent>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-28 rounded-xl" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            </div>
          ) : activeBusiness ? (
            <SmeDashboard />
          ) : (
            <PersonalDashboard planTier={planTier} />
          )}
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
