import type { ChartData } from "@/lib/staff/api/types";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";

export function SimpleBarChart({
  title,
  chart,
}: {
  title: string;
  chart: ChartData | null;
}) {
  if (!chart || chart.labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
        </CardHeader>
        <CardBody className="pt-0">
          <p className="text-sm text-muted">No chart data.</p>
        </CardBody>
      </Card>
    );
  }

  const max = Math.max(...chart.data, 1);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </CardHeader>
      <CardBody className="pt-0">
        <ul className="space-y-2">
          {chart.labels.map((label, i) => {
            const value = chart.data[i] ?? 0;
            const pct = Math.round((value / max) * 100);
            return (
              <li key={`${label}-${i}`}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted">{label}</span>
                  <span className="tabular-nums text-ink">{value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
