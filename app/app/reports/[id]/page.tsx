"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { AppPage, AppPageBody } from "@/components/dashboard/app-page";
import { AppPageContent } from "@/components/dashboard/app-page-content";
import { AppHeader } from "@/components/dashboard/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken } from "@/lib/auth/tokens";
import { reportsApi } from "@/lib/api";
import type { Report } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canUse } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    reportsApi.get(token, id).then(setReport).finally(() => setLoading(false));
  }, [id]);

  async function handleExport(format: "pdf" | "csv" | "xlsx") {
    const token = getAccessToken();
    if (!token || !id) return;
    setExporting(format);
    try {
      const { blob, filename } = await reportsApi.export(token, id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  if (loading) {
    return (
      <AppPage>
        <AppHeader title="Report" />
        <AppPageBody>
          <AppPageContent>
            <Skeleton className="h-48" />
          </AppPageContent>
        </AppPageBody>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppHeader
        title={report?.title ?? `${report?.type ?? "Report"}`}
        description={report?.created_at ? formatDate(report.created_at) : ""}
        action={
          canUse("export_reports") ? (
            <div className="flex flex-wrap gap-2">
              {(["pdf", "csv", "xlsx"] as const).map((f) => (
                <Button
                  key={f}
                  variant="secondary"
                  className="gap-1.5 uppercase"
                  disabled={exporting === f}
                  onClick={() => handleExport(f)}
                >
                  <Download className="size-3.5" />
                  {f}
                </Button>
              ))}
            </div>
          ) : undefined
        }
      />
      <AppPageBody>
        <AppPageContent>
          <Card>
            <CardBody>
              <pre className="overflow-auto text-xs text-mist">
                {JSON.stringify(report?.data ?? report?.summary ?? report, null, 2)}
              </pre>
            </CardBody>
          </Card>
          <Button variant="ghost" href="/app/reports">Back to reports</Button>
        </AppPageContent>
      </AppPageBody>
    </AppPage>
  );
}
