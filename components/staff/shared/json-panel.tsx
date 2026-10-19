"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/staff/ui/card";

export function JsonPanel({ title, data }: { title: string; data: unknown }) {
  const [showRaw, setShowRaw] = useState(false);
  const isObject = typeof data === "object" && data !== null && !Array.isArray(data);
  const entries = isObject ? Object.entries(data as Record<string, unknown>) : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="text-[11px] font-medium text-sky hover:underline"
        >
          {showRaw ? "Formatted view" : "Raw JSON"}
        </button>
      </CardHeader>
      <CardBody className="pt-0">
        {showRaw || !isObject || entries.length === 0 ? (
          <pre className="max-h-64 overflow-auto rounded-md bg-paper/60 p-3 text-xs font-mono text-ink border border-line/60">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {entries.map(([key, value]) => {
              const formattedKey = key.replace(/_/g, " ");
              const displayVal =
                value === null || value === undefined
                  ? "—"
                  : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-md bg-paper/40 px-3 py-2 text-xs border border-line/40"
                >
                  <span className="font-medium capitalize text-mist">{formattedKey}</span>
                  <span className="font-mono text-ink font-semibold truncate max-w-[60%] text-right">
                    {displayVal}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
