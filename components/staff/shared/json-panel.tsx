import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";

export function JsonPanel({ title, data }: { title: string; data: unknown }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </CardHeader>
      <CardBody className="pt-0">
        <pre className="max-h-64 overflow-auto rounded-md bg-bg p-3 text-xs text-ink">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardBody>
    </Card>
  );
}
