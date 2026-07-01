"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { PlanGate } from "@/components/plan/plan-gate";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/lib/auth/tokens";
import { businessesApi } from "@/lib/api";
import type { Business } from "@/lib/api/types";

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    businessesApi.get(token, id).then(setBusiness).finally(() => setLoading(false));
  }, [id]);

  async function switchTo() {
    const token = getAccessToken();
    if (!token || !id) return;
    await businessesApi.switch(token, id);
    router.refresh();
  }

  return (
    <AppPage>
      <AppHeader title={business?.name ?? "Business"} description={business?.type} />

      <AppPageBody>
      <AppPageContent>
        <PlanGate feature="multi_business">
          {loading ? (
            <Skeleton className="h-32" />
          ) : business ? (
            <>
              <Card>
                <CardBody className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{business.name}</p>
                    <p className="text-sm capitalize text-mist">{business.type}</p>
                  </div>
                  <Button variant="secondary" onClick={switchTo}>Set active</Button>
                </CardBody>
              </Card>
              <div className="flex gap-3">
                <Button variant="secondary" href={`/app/businesses/${id}/analytics`}>
                  Analytics
                </Button>
                <Button variant="secondary" href={`/app/businesses/${id}/team`}>
                  Team
                </Button>
              </div>
            </>
          ) : null}
        </PlanGate>
      </AppPageContent>
          </AppPageBody>
    </AppPage>  );
}
