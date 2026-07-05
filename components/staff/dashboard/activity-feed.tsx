import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";
import type { RecentActivity } from "@/lib/staff/api/types";

function formatEvent(event: string) {
  return event.replace(/_/g, " ");
}

export function ActivityFeed({ activity = [] }: { activity?: RecentActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
      </CardHeader>
      <CardBody className="pt-0">
        {activity.length === 0 ? (
          <p className="text-sm text-muted">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((item, i) => (
              <li key={`${item.timestamp}-${i}`} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm text-ink capitalize">{formatEvent(item.event)}</p>
                  <p className="text-xs text-muted">{item.email_masked}</p>
                </div>
                <div className="text-right">
                  {item.plan ? (
                    <p className="text-xs font-medium capitalize text-ink">{item.plan}</p>
                  ) : null}
                  <p className="text-xs text-muted">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
