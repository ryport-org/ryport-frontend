import { Badge } from "@/components/staff/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import type { ServiceStatusEntry } from "@/lib/staff/api/types";

function statusVariant(status: string): "success" | "warning" | "danger" | "default" {
  if (status === "ok") return "success";
  if (status === "degraded" || status === "warning") return "warning";
  if (status === "error" || status === "down") return "danger";
  return "default";
}

export function ServiceStatusPanel({
  serviceStatus,
}: {
  serviceStatus: Record<string, ServiceStatusEntry>;
}) {
  const entries = Object.entries(serviceStatus);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-ink">Service status</h2>
      </CardHeader>
      <CardBody className="pt-0">
        {entries.length === 0 ? (
          <p className="text-sm text-muted">No service data available.</p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map(([name, entry]) => (
              <li key={name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm capitalize text-ink">{name}</span>
                <div className="flex items-center gap-2">
                  {entry.response_ms != null ? (
                    <span className="text-xs text-muted">{entry.response_ms}ms</span>
                  ) : null}
                  {entry.memory_used ? (
                    <span className="text-xs text-muted">{entry.memory_used}</span>
                  ) : null}
                  {entry.active_workers != null ? (
                    <span className="text-xs text-muted">{entry.active_workers} workers</span>
                  ) : null}
                  <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
