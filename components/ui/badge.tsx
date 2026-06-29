import { cn } from "@/lib/utils";

const variants = {
  default: "bg-paper text-ink",
  sky: "bg-sky-soft text-sky",
  ink: "bg-ink text-white",
  warn: "bg-coral-warn/10 text-coral-warn",
  success: "bg-sky-soft text-sky",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
