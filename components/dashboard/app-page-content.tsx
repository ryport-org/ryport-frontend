import { cn } from "@/lib/utils";

/** Standard responsive padding + max width for dashboard page content. */
export function AppPageContent({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  /** Use full width (e.g. AI chat, wide tables) */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6 p-4 sm:space-y-6 sm:p-6 lg:p-8",
        !wide && "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
