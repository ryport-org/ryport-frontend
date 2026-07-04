import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function PlanDistribution({
  distribution,
}: {
  distribution: Record<string, number>;
}) {
  const total = Object.values(distribution).reduce((sum, n) => sum + n, 0);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-ink">Plan distribution</h2>
      </CardHeader>
      <CardBody className="pt-0">
        {total === 0 ? (
          <p className="text-sm text-muted">No plan data.</p>
        ) : (
          <ul className="space-y-3">
            {Object.entries(distribution).map(([plan, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <li key={plan}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-ink">{plan}</span>
                    <span className="tabular-nums text-muted">
                      {count.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
