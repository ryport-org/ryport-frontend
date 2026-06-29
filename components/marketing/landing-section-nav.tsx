"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const sections = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#product", label: "Product" },
  { href: "#pillars", label: "Why Ryport" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#customers", label: "Stories" },
  { href: "#explore", label: "Explore" },
];

export function LandingSectionNav() {
  return (
    <nav
      className="sticky top-[4.75rem] z-40 border-b border-line bg-paper/95 backdrop-blur-md"
      aria-label="Page sections"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 py-2.5 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              "text-mist hover:bg-sky-soft hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
