"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi } from "@/lib/api";

export default function BusinessAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    businessesApi.analytics(token, id, 90)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppPage>
      <AppHeader title="Business analytics" description="Revenue and expense trends" />

      <AppPageBody>
      <div className="p-6 sm:p-8">
        <PlanGate feature="business_dashboard">
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <Card>
              <CardBody>
                <pre className="overflow-auto text-xs text-mist">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </CardBody>
            </Card>
          )}
          <Button variant="ghost" className="mt-4" href={`/app/businesses/${id}`}>
            Back
          </Button>
        </PlanGate>
      </div>
          </AppPageBody>
    </AppPage>  );
}
