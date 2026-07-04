"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/staff/auth/permission-gate";
import { PageBody, PageHeader } from "@/components/staff/shell/page-header";
import { ApiErrorBanner, LoadingGrid } from "@/components/staff/shared/api-state";
import { useStaffFetch } from "@/components/staff/hooks/use-staff-fetch";
import { Badge } from "@/components/staff/ui/badge";
import { Button } from "@/components/staff/ui/button";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import { Input } from "@/components/staff/ui/input";
import { staffSystemApi } from "@/lib/staff/api";
import { getStaffAuthErrorMessage } from "@/lib/staff/auth/auth-context";
import { getStaffAccessToken } from "@/lib/staff/auth/tokens";

export default function SystemPage() {
  const health = useStaffFetch((t) => staffSystemApi.getHealth(t), []);
  const celery = useStaffFetch((t) => staffSystemApi.getCelery(t), []);
  const errors = useStaffFetch((t) => staffSystemApi.getErrors(t), []);
  const alerts = useStaffFetch((t) => staffSystemApi.listAlerts({ resolved: false }, t), []);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const error = health.error || celery.error;
  const loading = health.loading || celery.loading;

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    const token = getStaffAccessToken();
    if (!token) return;
    setFormError("");
    try {
      await staffSystemApi.createAlert(
        { title, message, severity: "warning" },
        token,
      );
      setTitle("");
      setMessage("");
      alerts.reload();
    } catch (err) {
      setFormError(getStaffAuthErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="System" description="Health, Celery, errors, and alerts" />
      <PageBody>
        <PermissionGate permission="can_view_system">
          {error ? <ApiErrorBanner message={error} onRetry={health.reload} /> : null}
          {loading ? (
            <LoadingGrid />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardBody>
                    <p className="text-xs text-muted">Health</p>
                    <p className="mt-1 text-lg font-semibold capitalize text-ink">
                      {health.data?.status ?? "—"}
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-xs text-muted">Celery</p>
                    <p className="mt-1 text-lg font-semibold capitalize text-ink">
                      {celery.data?.status ?? "—"}
                    </p>
                    {celery.data?.active_workers != null ? (
                      <p className="text-xs text-muted">{celery.data.active_workers} workers</p>
                    ) : null}
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-ink">Recent errors</h2>
                </CardHeader>
                <CardBody className="pt-0">
                  {!errors.data?.length ? (
                    <p className="text-sm text-muted">No errors reported.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {errors.data.map((err, i) => (
                        <li key={err.id ?? i} className="py-2 text-sm">
                          <p className="text-ink">{err.message}</p>
                          {err.last_seen ? (
                            <p className="text-xs text-muted">{err.last_seen}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-ink">Active alerts</h2>
                </CardHeader>
                <CardBody className="space-y-4 pt-0">
                  {!alerts.data?.length ? (
                    <p className="text-sm text-muted">No active alerts.</p>
                  ) : (
                    <ul className="space-y-3">
                      {alerts.data.map((alert) => (
                        <li
                          key={alert.id}
                          className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-ink">{alert.title}</p>
                            {alert.message ? (
                              <p className="mt-1 text-xs text-muted">{alert.message}</p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="warning">{alert.severity}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                void (async () => {
                                  const t = getStaffAccessToken();
                                  if (t) {
                                    await staffSystemApi.resolveAlert(alert.id, t);
                                    alerts.reload();
                                  }
                                })()
                              }
                            >
                              Resolve
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form className="space-y-3 border-t border-border pt-4" onSubmit={(e) => void createAlert(e)}>
                    <p className="text-sm font-medium text-ink">Create alert</p>
                    <Input
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                    {formError ? <p className="text-sm text-danger">{formError}</p> : null}
                    <Button type="submit">Create</Button>
                  </form>
                </CardBody>
              </Card>
            </div>
          )}
        </PermissionGate>
      </PageBody>
    </>
  );
}
