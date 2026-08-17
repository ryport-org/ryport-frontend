"use client";

import { useEffect, useState, useCallback } from "react";

export type PlatformType = "ios" | "android_chrome" | "unsupported";
export type PromptVariant = "bottom_sheet" | "modal_daily" | "modal_every_session";

export interface PwaInstallState {
  isInstalled: boolean;
  isSupported: boolean;
  platform: PlatformType;
  dismissedCount: number;
  variant: PromptVariant;
  benefitCopy: string;
  shouldShowPrompt: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

const BENEFIT_COPIES = [
  "Get instant notifications for transactions and account updates.",
  "Open faster with zero browser address bar clutter.",
  "Works offline so you can view your financials anytime.",
];

const LOCAL_STORAGE_COUNT_KEY = "pwa_install_dismissed_count";
const LOCAL_STORAGE_LAST_SHOWN_KEY = "pwa_install_last_shown_at";
const LOCAL_STORAGE_INSTALLED_KEY = "pwa_install_installed";
const SESSION_STORAGE_SHOWN_KEY = "pwa_install_session_shown";

export function useInstallPrompt(): PwaInstallState {
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>("unsupported");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [benefitIndex, setBenefitIndex] = useState(0);

  // Initialize and detect environment
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check standalone / installed status
    const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isMarkedInstalled = localStorage.getItem(LOCAL_STORAGE_INSTALLED_KEY) === "true";

    if (isStandaloneMedia || isIOSStandalone || isMarkedInstalled) {
      setIsInstalled(true);
      if (!isMarkedInstalled) {
        localStorage.setItem(LOCAL_STORAGE_INSTALLED_KEY, "true");
      }
      return;
    }

    // 2. Read dismissal count
    const storedCount = parseInt(localStorage.getItem(LOCAL_STORAGE_COUNT_KEY) || "0", 10);
    setDismissedCount(isNaN(storedCount) ? 0 : storedCount);

    // Set rotating benefit copy index based on count or random/modulo
    setBenefitIndex(storedCount % BENEFIT_COPIES.length);

    // 3. Detect Platform
    const ua = navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    const isFirefoxDesktop = /Firefox/i.test(ua) && !/Android/i.test(ua) && !isIOSDevice;

    if (isIOSDevice) {
      setPlatform("ios");
    } else if (isFirefoxDesktop) {
      setPlatform("unsupported");
    } else {
      // Default to android_chrome candidate until beforeinstallprompt fires or fallback check
      setPlatform("android_chrome");
    }

    // 4. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android_chrome");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem(LOCAL_STORAGE_INSTALLED_KEY, "true");
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Compute prompt visibility & variant based on escalation schedule
  useEffect(() => {
    if (typeof window === "undefined" || isInstalled) {
      setIsVisible(false);
      return;
    }

    if (platform === "unsupported") {
      setIsVisible(false);
      return;
    }

    const sessionShown = sessionStorage.getItem(SESSION_STORAGE_SHOWN_KEY) === "true";

    if (dismissedCount === 0) {
      // First time: bottom sheet on app load
      setIsVisible(true);
    } else if (dismissedCount === 1 || dismissedCount === 2) {
      // 1-2 dismissals: once per session
      if (!sessionShown) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      // 3+ dismissals: every session on load
      if (!sessionShown) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  }, [isInstalled, platform, dismissedCount]);

  const dismissPrompt = useCallback(() => {
    const nextCount = dismissedCount + 1;
    setDismissedCount(nextCount);
    localStorage.setItem(LOCAL_STORAGE_COUNT_KEY, nextCount.toString());
    localStorage.setItem(LOCAL_STORAGE_LAST_SHOWN_KEY, Date.now().toString());
    sessionStorage.setItem(SESSION_STORAGE_SHOWN_KEY, "true");
    setIsVisible(false);
  }, [dismissedCount]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // Fallback if beforeinstallprompt hasn't fired yet
      dismissPrompt();
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem(LOCAL_STORAGE_INSTALLED_KEY, "true");
        setIsVisible(false);
      } else {
        dismissPrompt();
      }
    } catch {
      dismissPrompt();
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, dismissPrompt]);

  let variant: PromptVariant = "bottom_sheet";
  if (dismissedCount >= 3) {
    variant = "modal_every_session";
  } else if (dismissedCount >= 1) {
    variant = "modal_daily";
  }

  const isSupported = platform !== "unsupported" && !isInstalled;

  return {
    isInstalled,
    isSupported,
    platform,
    dismissedCount,
    variant,
    benefitCopy: BENEFIT_COPIES[benefitIndex],
    shouldShowPrompt: isVisible && isSupported,
    promptInstall,
    dismissPrompt,
  };
}
