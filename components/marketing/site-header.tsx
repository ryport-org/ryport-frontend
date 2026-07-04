"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavBrand } from "@/components/marketing/nav-brand";
import { AuthNavActions } from "@/components/marketing/auth-nav-actions";
import { isNavActive, navMenus } from "@/components/marketing/nav-config";
import { cn } from "@/lib/utils";

function NavDropdown({
  label,
  items,
  active,
}: {
  label: string;
  items: { href: string; label: string; description: string }[];
  active: boolean;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          active
            ? "bg-white/15 text-white"
            : "text-white/75 hover:bg-white/10 hover:text-white",
        )}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className="size-3.5 opacity-70 transition-transform duration-200 group-hover:rotate-180" />
      </button>

      <div
        className={cn(
          "pointer-events-none absolute top-full left-1/2 z-50 w-72 -translate-x-1/2 pt-3",
          "opacity-0 translate-y-1 transition-all duration-200 ease-out",
          "group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0",
          "group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0",
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-[0_16px_48px_rgba(19,23,31,0.14)]">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-sky-soft"
            >
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-mist">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4 rounded-full bg-ink px-2 py-2 pl-2 pr-2 shadow-[0_8px_32px_rgba(19,23,31,0.28)] sm:px-3 lg:gap-6">
          <NavBrand />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {navMenus.map((menu) => (
              <NavDropdown
                key={menu.label}
                label={menu.label}
                items={menu.items}
                active={isNavActive(pathname, menu)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AuthNavActions className="hidden xl:flex" />

            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <AuthNavActions className="xl:hidden" />
          </div>
        </div>

        {open ? (
          <nav
            className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-ink p-2 shadow-[0_8px_32px_rgba(19,23,31,0.28)] lg:hidden"
            aria-label="Mobile"
          >
            {navMenus.map((menu) => {
              const isExpanded = expanded === menu.label;
              return (
                <div key={menu.label} className="border-b border-white/10 last:border-0">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(isExpanded ? null : menu.label)
                    }
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-white"
                  >
                    {menu.label}
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>
                  {isExpanded ? (
                    <div className="pb-2 pl-2">
                      {menu.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-4 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="mt-1 border-t border-white/10 pt-3">
              <AuthNavActions
                onNavigate={() => setOpen(false)}
                showRegister={false}
                linkClassName="block w-full rounded-xl px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white xl:hidden"
                primaryClassName="block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-ink"
              />
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
