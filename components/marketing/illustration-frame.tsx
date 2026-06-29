import { cn } from "@/lib/utils";

type IllustrationFrameProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "soft" | "white" | "none";
};

export function IllustrationFrame({
  children,
  className,
  variant = "soft",
}: IllustrationFrameProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center overflow-hidden rounded-xl",
        variant === "soft" && "border border-line bg-sky-soft/40 p-6 sm:p-8",
        variant === "white" && "border border-line bg-white p-6 sm:p-8",
        variant === "none" && "p-4",
        className,
      )}
    >
      <div className="w-full max-w-[260px]">{children}</div>
    </div>
  );
}
