"use client";

import { useId, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Layers,
  Scale,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { CashFlowDashboardData } from "@/lib/api/types";
import { formatDate, formatKobo } from "@/lib/format";

type Props = {
  data: CashFlowDashboardData;
};

export function CashFlowChart({ data }: Props) {
  const [activeView, setActiveView] = useState<"flows" | "balance">("flows");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = useId();

  const daily = data.daily || [];

  // Compute SVG dimensions & coordinates
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const {
    inflowPath,
    inflowArea,
    outflowPath,
    outflowArea,
    balancePath,
    balanceArea,
    maxFlow,
    maxBalance,
    minBalance,
    points,
  } = useMemo(() => {
    if (daily.length === 0) {
      return {
        inflowPath: "",
        inflowArea: "",
        outflowPath: "",
        outflowArea: "",
        balancePath: "",
        balanceArea: "",
        maxFlow: 1,
        maxBalance: 1,
        minBalance: 0,
        points: [],
      };
    }

    const maxFlowVal = Math.max(
      ...daily.map((d) => Math.max(d.inflow_kobo || 0, d.outflow_kobo || 0)),
      1,
    );

    const balances = daily.map((d) => d.balance_kobo || 0);
    const maxBalVal = Math.max(...balances, 1);
    const minBalVal = Math.min(...balances, 0);
    const balRange = maxBalVal - minBalVal || 1;

    const computedPoints = daily.map((d, index) => {
      const x = padding.left + (index / Math.max(daily.length - 1, 1)) * chartWidth;
      const yInflow =
        padding.top + chartHeight - ((d.inflow_kobo || 0) / maxFlowVal) * chartHeight;
      const yOutflow =
        padding.top + chartHeight - ((d.outflow_kobo || 0) / maxFlowVal) * chartHeight;
      const yBalance =
        padding.top + chartHeight - (((d.balance_kobo || 0) - minBalVal) / balRange) * chartHeight;

      return { x, yInflow, yOutflow, yBalance, d };
    });

    const inflowP = computedPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yInflow.toFixed(1)}`)
      .join(" ");

    const inflowA = `${inflowP} L ${computedPoints[computedPoints.length - 1].x.toFixed(1)} ${(
      padding.top + chartHeight
    ).toFixed(1)} L ${computedPoints[0].x.toFixed(1)} ${(padding.top + chartHeight).toFixed(1)} Z`;

    const outflowP = computedPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yOutflow.toFixed(1)}`)
      .join(" ");

    const outflowA = `${outflowP} L ${computedPoints[computedPoints.length - 1].x.toFixed(1)} ${(
      padding.top + chartHeight
    ).toFixed(1)} L ${computedPoints[0].x.toFixed(1)} ${(padding.top + chartHeight).toFixed(1)} Z`;

    const balanceP = computedPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yBalance.toFixed(1)}`)
      .join(" ");

    const balanceA = `${balanceP} L ${computedPoints[computedPoints.length - 1].x.toFixed(1)} ${(
      padding.top + chartHeight
    ).toFixed(1)} L ${computedPoints[0].x.toFixed(1)} ${(padding.top + chartHeight).toFixed(1)} Z`;

    return {
      inflowPath: inflowP,
      inflowArea: inflowA,
      outflowPath: outflowP,
      outflowArea: outflowA,
      balancePath: balanceP,
      balanceArea: balanceA,
      maxFlow: maxFlowVal,
      maxBalance: maxBalVal,
      minBalance: minBalVal,
      points: computedPoints,
    };
  }, [daily, chartWidth, chartHeight, padding.left, padding.top]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="space-y-6">
      {/* 90-Day KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-mist uppercase tracking-wide">
                Total 90D Inflows
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ArrowDownLeft className="size-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums text-emerald-700">
              {formatKobo(data.inflows_kobo || 0)}
            </p>
            <p className="mt-1 text-[11px] text-mist">Money received across {data.period_days || 90} days</p>
          </CardBody>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-mist uppercase tracking-wide">
                Total 90D Outflows
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <ArrowUpRight className="size-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums text-rose-700">
              {formatKobo(data.outflows_kobo || 0)}
            </p>
            <p className="mt-1 text-[11px] text-mist">Total expenses & debits recorded</p>
          </CardBody>
        </Card>

        <Card className="border-sky/20 bg-sky-soft/30">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-mist uppercase tracking-wide">
                Net 90D Cash Flow
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-sky/10 text-sky">
                <Scale className="size-4" />
              </div>
            </div>
            <p
              className={`mt-3 font-display text-2xl font-bold tabular-nums ${
                (data.net_kobo || 0) >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {(data.net_kobo || 0) >= 0 ? "+" : ""}
              {formatKobo(data.net_kobo || 0)}
            </p>
            <p className="mt-1 text-[11px] text-mist">Inflows minus Outflows</p>
          </CardBody>
        </Card>
      </div>

      {/* Main Chart Card */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">
              90-Day Trailing Cash Flow
            </h2>
            <p className="mt-0.5 text-xs text-mist">
              Daily transaction velocity & liquidity trends
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-paper p-1 border border-line">
            <button
              type="button"
              onClick={() => setActiveView("flows")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeView === "flows"
                  ? "bg-white text-ink shadow-xs font-semibold"
                  : "text-mist hover:text-ink"
              }`}
            >
              <Layers className="size-3.5" /> Inflows & Outflows
            </button>
            <button
              type="button"
              onClick={() => setActiveView("balance")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeView === "balance"
                  ? "bg-white text-ink shadow-xs font-semibold"
                  : "text-mist hover:text-ink"
              }`}
            >
              <Scale className="size-3.5" /> Net Balance
            </button>
          </div>
        </CardHeader>

        {daily.length === 0 ? (
          <div className="py-16 text-center text-sm text-mist">
            No daily cash flow data available for this period.
          </div>
        ) : (
          <div className="relative">
            {/* SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto min-w-[500px]"
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  {/* Inflow gradient */}
                  <linearGradient id={`${chartId}-inflow-grad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Outflow gradient */}
                  <linearGradient id={`${chartId}-outflow-grad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Balance gradient */}
                  <linearGradient id={`${chartId}-balance-grad`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding.top + chartHeight * ratio;
                  const labelValue =
                    activeView === "flows"
                      ? maxFlow * (1 - ratio)
                      : minBalance + (maxBalance - minBalance) * (1 - ratio);

                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94A3B8"
                        fontFamily="sans-serif"
                      >
                        {formatKobo(labelValue)}
                      </text>
                    </g>
                  );
                })}

                {/* Series Areas & Lines */}
                {activeView === "flows" ? (
                  <>
                    {/* Inflow Area & Path */}
                    <path d={inflowArea} fill={`url(#${chartId}-inflow-grad)`} />
                    <path
                      d={inflowPath}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Outflow Area & Path */}
                    <path d={outflowArea} fill={`url(#${chartId}-outflow-grad)`} />
                    <path
                      d={outflowPath}
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    {/* Balance Area & Path */}
                    <path d={balanceArea} fill={`url(#${chartId}-balance-grad)`} />
                    <path
                      d={balancePath}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Hover Indicator Line & Hit targets */}
                {points.map((pt, i) => (
                  <rect
                    key={i}
                    x={pt.x - chartWidth / daily.length / 2}
                    y={padding.top}
                    width={chartWidth / daily.length}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                  />
                ))}

                {activePoint && (
                  <g pointerEvents="none">
                    <line
                      x1={activePoint.x}
                      y1={padding.top}
                      x2={activePoint.x}
                      y2={padding.top + chartHeight}
                      stroke="#64748B"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {activeView === "flows" ? (
                      <>
                        <circle
                          cx={activePoint.x}
                          cy={activePoint.yInflow}
                          r="5"
                          fill="#10B981"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <circle
                          cx={activePoint.x}
                          cy={activePoint.yOutflow}
                          r="5"
                          fill="#F43F5E"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      </>
                    ) : (
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.yBalance}
                        r="5"
                        fill="#0284C7"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                )}

                {/* X-axis date labels */}
                {points
                  .filter(
                    (_, i) =>
                      i === 0 ||
                      i === Math.floor(points.length / 2) ||
                      i === points.length - 1,
                  )
                  .map((pt, i) => (
                    <text
                      key={i}
                      x={pt.x}
                      y={height - 12}
                      textAnchor={
                        i === 0 ? "start" : i === 2 ? "end" : "middle"
                      }
                      fontSize="11"
                      fill="#64748B"
                      fontFamily="sans-serif"
                    >
                      {formatDate(pt.d.date)}
                    </text>
                  ))}
              </svg>
            </div>

            {/* Hover Tooltip Box */}
            {activePoint && (
              <div
                className="pointer-events-none absolute top-4 right-4 rounded-xl border border-line bg-white/95 p-3.5 shadow-lg backdrop-blur-xs text-xs space-y-1.5"
              >
                <div className="flex items-center gap-1.5 font-semibold text-ink border-b border-line pb-1">
                  <Calendar className="size-3 text-mist" />
                  {formatDate(activePoint.d.date)}
                </div>
                <div className="flex justify-between gap-4 text-emerald-700 font-medium">
                  <span>Inflow:</span>
                  <span className="tabular-nums font-bold">
                    +{formatKobo(activePoint.d.inflow_kobo || 0)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-rose-700 font-medium">
                  <span>Outflow:</span>
                  <span className="tabular-nums font-bold">
                    -{formatKobo(activePoint.d.outflow_kobo || 0)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sky font-medium border-t border-line/60 pt-1">
                  <span>Balance:</span>
                  <span className="tabular-nums font-bold text-ink">
                    {formatKobo(activePoint.d.balance_kobo || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
