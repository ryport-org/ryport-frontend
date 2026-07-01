"use client";

import { useEffect, useState } from "react";
import { AppShellProvider } from "@/components/dashboard/app-shell-context";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <AppShellProvider
      value={{ mobileNavOpen, setMobileNavOpen, closeMobileNav }}
    >
      <div className="flex h-dvh overflow-hidden bg-paper">
        {mobileNavOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] lg:hidden"
            onClick={closeMobileNav}
          />
        ) : null}

        <AppSidebar />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </AppShellProvider>
  );
}
