import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
  secondary:
    "border border-border bg-surface text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
  ghost:
    "text-ink hover:bg-surface active:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
  danger:
    "bg-danger text-white hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  "inline-flex min-h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-[color,background,border] duration-150 ease-out disabled:opacity-50";

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button type="button" className={cn(base, variantStyles[variant], className)} {...props} />;
}
