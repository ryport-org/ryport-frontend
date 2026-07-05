import { Badge } from "@/components/staff/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import type { SystemAlert } from "@/lib/staff/api/types";

function severityVariant(severity: string): "warning" | "danger" | "default" {
  if (severity === "critical" || severity === "error") return "danger";
  if (severity === "warning") return "warning";
  return "default";
}

export function AlertsList({ alerts = [] }: { alerts?: SystemAlert[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-ink">System alerts</h2>
      </CardHeader>
      <CardBody className="pt-0">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted">No active alerts.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
