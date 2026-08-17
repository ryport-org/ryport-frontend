(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { useInstallPrompt, type PwaInstallState } from "@/lib/pwa/use-install-prompt";

function TestHarness({ onState }: { onState: (state: PwaInstallState) => void }) {
  const state = useInstallPrompt();
  onState(state);
  return null;
}

function renderInstallHook(): { getState: () => PwaInstallState; cleanup: () => void } {
  let currentState: PwaInstallState | undefined;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<TestHarness onState={(s) => { currentState = s; }} />);
  });

  return {
    getState: () => currentState!,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("PWA Install Prompt Hook & Logic", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it("never shows install prompt if app is already running in standalone mode", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { getState, cleanup } = renderInstallHook();
    expect(getState().isInstalled).toBe(true);
    expect(getState().shouldShowPrompt).toBe(false);
    cleanup();
  });

  it("never shows install prompt if iOS standalone flag is true", () => {
    Object.defineProperty(window.navigator, "standalone", {
      value: true,
      configurable: true,
    });

    const { getState, cleanup } = renderInstallHook();
    expect(getState().isInstalled).toBe(true);
    expect(getState().shouldShowPrompt).toBe(false);
    cleanup();

    Object.defineProperty(window.navigator, "standalone", {
      value: undefined,
      configurable: true,
    });
  });

  it("never shows prompt on unsupported desktop platforms (e.g. Firefox Desktop)", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
      configurable: true,
    });

    const { getState, cleanup } = renderInstallHook();
    expect(getState().platform).toBe("unsupported");
    expect(getState().isSupported).toBe(false);
    expect(getState().shouldShowPrompt).toBe(false);
    cleanup();
  });

  it("correctly identifies iOS Safari and routes to manual instructional prompt", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
      configurable: true,
    });

    const { getState, cleanup } = renderInstallHook();
    expect(getState().platform).toBe("ios");
    expect(getState().isSupported).toBe(true);
    expect(getState().shouldShowPrompt).toBe(true);
    cleanup();
  });

  it("escalates prompt variants correctly based on dismissal count (0 -> bottom_sheet, 1-2 -> modal_daily, 3+ -> modal_every_session)", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      configurable: true,
    });

    // Dismissal count 0
    const h0 = renderInstallHook();
    expect(h0.getState().dismissedCount).toBe(0);
    expect(h0.getState().variant).toBe("bottom_sheet");
    h0.cleanup();

    // Dismissal count 1
    localStorage.setItem("pwa_install_dismissed_count", "1");
    const h1 = renderInstallHook();
    expect(h1.getState().dismissedCount).toBe(1);
    expect(h1.getState().variant).toBe("modal_daily");
    h1.cleanup();

    // Dismissal count 3
    localStorage.setItem("pwa_install_dismissed_count", "3");
    const h3 = renderInstallHook();
    expect(h3.getState().dismissedCount).toBe(3);
    expect(h3.getState().variant).toBe("modal_every_session");
    h3.cleanup();
  });

  it("increments dismissal count and persists to localStorage on dismissPrompt()", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      configurable: true,
    });

    const { getState, cleanup } = renderInstallHook();
    expect(getState().dismissedCount).toBe(0);

    act(() => {
      getState().dismissPrompt();
    });

    expect(localStorage.getItem("pwa_install_dismissed_count")).toBe("1");
    expect(getState().shouldShowPrompt).toBe(false);
    cleanup();
  });
});
