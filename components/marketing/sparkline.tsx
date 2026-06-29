import { cn } from "@/lib/utils";

type SparklineProps = {
  className?: string;
  /** Normalized y values 0–100, left to right */
  points?: number[];
};

const DEFAULT_POINTS = [72, 68, 74, 61, 66, 52, 58, 44, 49, 36, 41, 28];

function buildPath(points: number[], width: number, height: number) {
  const step = width / (points.length - 1);
  const coords = points.map((y, i) => {
    const x = i * step;
    const normalizedY = height - (y / 100) * height;
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${normalizedY.toFixed(2)}`;
  });
  return coords.join(" ");
}

function buildAreaPath(points: number[], width: number, height: number) {
  const line = buildPath(points, width, height);
  return `${line} L${width},${height} L0,${height} Z`;
}

export function Sparkline({
  className,
  points = DEFAULT_POINTS,
}: SparklineProps) {
  const width = 400;
  const height = 80;
  const linePath = buildPath(points, width, height);
  const areaPath = buildAreaPath(points, width, height);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path d={areaPath} fill="var(--sky-soft)" fillOpacity="0.65" />
      <path
        d={linePath}
        stroke="var(--sky)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
