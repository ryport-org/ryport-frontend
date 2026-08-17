"use client";

import { useEffect } from "react";
import { InstallPromptModal } from "@/components/pwa/install-prompt-modal";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register service worker for PWA installability
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("Service worker registration failed:", err));
  }, []);

  return (
    <>
      {children}
      <InstallPromptModal />
    </>
  );
}
