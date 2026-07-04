"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { useStaffFetch } from "@/components/staff/hooks/use-staff-fetch";
import { Button } from "@/components/staff/ui/button";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import { Input } from "@/components/staff/ui/input";
import { staffAnnouncementsApi } from "@/lib/staff/api";
import { getStaffAuthErrorMessage } from "@/lib/staff/auth/auth-context";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";

export default function AnnouncementsPage() {
  const { data, loading, error, reload } = useStaffFetch(
    (t) => staffAnnouncementsApi.listAnnouncements(t),
    [],
  );
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getStaffAccessToken();
    if (!token) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await staffAnnouncementsApi.createAnnouncement(
        {
          title,
          message,
          target_plans: ["free", "pro", "advanced"],
          send_email: true,
          send_in_app: true,
        },
        token,
      );
      setTitle("");
      setMessage("");
      reload();
    } catch (err) {
      setSubmitError(getStaffAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Announcements" description="Broadcast to customer segments" />
      <PageBody>
        <PermissionGate permission="can_send_announcements">
          {error ? <ApiErrorBanner message={error} onRetry={reload} /> : null}

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-sm font-semibold text-ink">New announcement</h2>
            </CardHeader>
            <CardBody className="pt-0">
              <form className="space-y-4" onSubmit={(e) => void handleCreate(e)}>
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
                />
                {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Create announcement"}
                </Button>
              </form>
            </CardBody>
          </Card>

          {loading ? (
            <LoadingGrid count={1} height="h-32" />
          ) : data && data.length > 0 ? (
            <ul className="space-y-3">
              {data.map((a) => (
                <Card key={a.id}>
                  <CardBody>
                    <h3 className="font-semibold text-ink">{a.title}</h3>
                    <p className="mt-2 text-sm text-muted">{a.message}</p>
                    {a.created_at ? (
                      <p className="mt-2 text-xs text-muted">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    ) : null}
                  </CardBody>
                </Card>
              ))}
            </ul>
          ) : !error ? (
            <p className="text-sm text-muted">No announcements yet.</p>
          ) : null}
        </PermissionGate>
      </PageBody>
    </>
  );
}
