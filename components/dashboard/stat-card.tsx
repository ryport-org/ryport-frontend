import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function StatCard({
  label,
  value,
  change,
  changePositive = true,
  className,
  children,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-white p-5 transition-shadow hover:shadow-[0_8px_32px_rgba(19,23,31,0.06)]",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-mist">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="mt-2 font-display text-xl tabular-nums text-ink sm:text-2xl lg:text-3xl break-words">{value}</p>
        {change ? (
          <span
            className={cn(
              "mb-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              changePositive ? "bg-sky-soft text-sky" : "bg-coral-warn/10 text-coral-warn",
            )}
          >
            {change}
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
