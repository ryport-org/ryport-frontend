import { Sparkline } from "@/components/marketing/sparkline";
import { cn } from "@/lib/utils";

type DashboardPreviewProps = {
  className?: string;
};

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-paper px-4 py-3">
      <p className="text-xs font-medium text-mist">{label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className="font-semibold tabular-nums text-ink">{value}</p>
        <span className="text-xs font-semibold text-sky">{change}</span>
      </div>
    </div>
  );
}

export function DashboardPreview({ className }: DashboardPreviewProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-line bg-white shadow-[0_8px_32px_rgba(19,23,31,0.1)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-sky" />
          <span className="size-2.5 rounded-full bg-sky-soft" />
          <span className="size-2.5 rounded-full bg-mist" />
        </div>
        <span className="text-xs text-mist">app.ryport.io / dashboard</span>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-sm text-mist">Good morning, Ryan</p>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wide text-mist">
            Revenue
          </p>
          <div className="relative mt-2">
            <div
              className="pointer-events-none absolute -inset-x-2 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <Sparkline />
            </div>
            <div className="relative z-10 flex items-end justify-between gap-4">
              <p
                className="font-display font-normal tabular-nums text-ink"
                style={{
                  fontSize: "clamp(2.25rem, 7vw, 3.75rem)",
                  lineHeight: 1,
                }}
              >
                ₦842,500
              </p>
              <span className="mb-1 rounded-full bg-sky-soft px-2.5 py-1 text-sm font-semibold text-sky">
                +12%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="New users" value="2,780" change="+8%" />
          <StatCard label="Projects" value="18" change="+2" />
          <div className="rounded-lg border border-line bg-paper px-4 py-3">
            <p className="text-xs font-medium text-mist">Earnings</p>
            <p className="mt-1 text-xs font-semibold text-ink">This month</p>
            <div className="mt-2 h-8">
              <Sparkline
                points={[40, 45, 42, 55, 50, 62, 58, 70, 68, 75, 72, 80]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
