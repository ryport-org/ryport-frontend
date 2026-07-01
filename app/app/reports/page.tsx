"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { reportsApi } from "@/lib/api";
import type { Report } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { getAuthErrorMessage } from "@/lib/auth/auth-context";

export default function ReportsPage() {
  const { canUse } = useAuth();
  const canPl = canUse("pl_reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      setReports(await reportsApi.list(token));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function generate(type: string) {
    const token = getAccessToken();
    if (!token) return;
    setGenerating(true);
    setError("");
    try {
      await reportsApi.generate(token, { type: type as "weekly" | "monthly" | "pl" });
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  async function exportReport(id: string, format: "pdf" | "csv" | "xlsx") {
    const token = getAccessToken();
    if (!token) return;
    const { blob, filename } = await reportsApi.export(token, id, format);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppPage>
      <AppHeader
        title="Reports"
        description="Monthly summaries, weekly insights, and P&L"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={generating} onClick={() => generate("weekly")}>
              Weekly
            </Button>
            <Button variant="secondary" disabled={generating} onClick={() => generate("monthly")}>
              Monthly
            </Button>
            {canPl ? (
              <Button variant="secondary" disabled={generating} onClick={() => generate("pl")}>
                P&L
              </Button>
            ) : null}
          </div>
        }
      />

      <AppPageBody>
      <AppPageContent>
        {error ? <p className="text-sm text-coral-warn">{error}</p> : null}

        {loading ? (
          <Skeleton className="h-48" />
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto size-8 text-mist" />
            <p className="mt-3 text-sm text-mist">No reports yet. Generate one above.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">
                        {report.title ?? `${report.type} report`}
                      </p>
                      <Badge variant="sky" className="uppercase">
                        {report.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-mist">
                      {formatDate(report.created_at)}
                      {report.period ? ` · ${report.period}` : ""}
                    </p>
                  </div>
                    <Button variant="ghost" href={`/app/reports/${report.id}`} className="text-xs">
                      View
                    </Button>
                </CardBody>
              </Card>
            ))}
          </ul>
        )}
      </AppPageContent>
          </AppPageBody>
    </AppPage>  );
}
