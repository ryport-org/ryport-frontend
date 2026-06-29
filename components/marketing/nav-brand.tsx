import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavBrandProps = {
  className?: string;
};

export function NavBrand({ className }: NavBrandProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-full pr-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-white sm:size-11">
        <Image
          src="/logo.png"
          alt=""
          width={22}
          height={22}
          className="object-contain"
          style={{ width: 22, height: "auto" }}
          priority
        />
      </span>
      <span className="font-display text-base text-white sm:text-lg">Ryport</span>
    </Link>
  );
}
