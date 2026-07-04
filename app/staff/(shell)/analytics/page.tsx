"use client";

import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { JsonPanel } from "@/components/staff/shared/json-panel";
import { useStaffFetch } from "@/components/staff/hooks/use-staff-fetch";
import { staffAnalyticsApi } from "@/lib/staff/api";

export default function AnalyticsPage() {
  const feature = useStaffFetch((t) => staffAnalyticsApi.getFeatureAdoption(t), []);
  const engagement = useStaffFetch((t) => staffAnalyticsApi.getEngagement(t), []);
  const ai = useStaffFetch((t) => staffAnalyticsApi.getAiAnalytics(t), []);
  const banking = useStaffFetch((t) => staffAnalyticsApi.getBankingAnalytics(t), []);
  const transactions = useStaffFetch((t) => staffAnalyticsApi.getTransactionAnalytics(t), []);

  const loading = feature.loading || engagement.loading;
  const error = feature.error || engagement.error;

  return (
    <>
      <PageHeader title="Analytics" description="Feature adoption, engagement, and usage" />
      <PageBody>
        <PermissionGate permission="can_view_analytics">
          {error ? <ApiErrorBanner message={error} onRetry={feature.reload} /> : null}
          {loading ? (
            <LoadingGrid count={2} height="h-48" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <JsonPanel title="Feature adoption" data={feature.data ?? {}} />
              <JsonPanel title="Engagement" data={engagement.data ?? {}} />
              <JsonPanel title="AI usage" data={ai.data ?? {}} />
              <JsonPanel title="Banking" data={banking.data ?? {}} />
              <JsonPanel title="Transactions" data={transactions.data ?? {}} />
            </div>
          )}
        </PermissionGate>
      </PageBody>
    </>
  );
}
