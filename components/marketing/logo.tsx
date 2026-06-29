import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: 28,
  md: 36,
  lg: 44,
};

export function Logo({ className, size = "md" }: LogoProps) {
  const dim = sizes[size];

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="Ryport"
        width={dim}
        height={dim}
        className="h-auto w-auto object-contain"
        style={{ width: dim, height: "auto" }}
        priority
      />
      <span className="font-display text-xl font-normal text-ink">Ryport</span>
    </Link>
  );
}

type LogoMarkProps = {
  className?: string;
  size?: number;
};

export function LogoMark({ className, size = 22 }: LogoMarkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        className,
      )}
      style={{ width: size + 18, height: size + 18 }}
      aria-label="Ryport home"
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: "auto" }}
        priority
      />
    </Link>
  );
}
