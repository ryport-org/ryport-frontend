import { cn } from "@/lib/utils";

/** Full-height page shell — use inside /app layout (pairs with AppHeader). */
export function AppPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 w-full flex-col overflow-hidden", className)}>
      {children}
    </div>
  );
}

/** Scrollable page body below AppHeader. */
export function AppPageBody({
  children,
  className,
  scroll = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Set false for full-bleed layouts like AI chat */
  scroll?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col",
        scroll && "overflow-y-auto overflow-x-hidden overscroll-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}
