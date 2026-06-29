import { cn } from "@/lib/utils";

export const inputClassName =
  "block w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-mist focus:border-sky focus:ring-2 focus:ring-sky/20";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}
