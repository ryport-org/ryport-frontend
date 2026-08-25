"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Detects mobile on-screen keyboard open/close using the Visual Viewport API.
 *
 * How it works:
 * - When the keyboard opens, `window.visualViewport.height` shrinks while
 *   `window.innerHeight` (layout viewport) stays the same on iOS, or the
 *   visual viewport height becomes smaller than the initial viewport height.
 * - We compute keyboardHeight = initialViewportHeight - visualViewport.height
 *   and expose it so consumers can offset the input bar above the keyboard.
 *
 * Returns:
 * - `keyboardHeight`: The pixel height of the keyboard (0 when closed).
 * - `isKeyboardOpen`: Convenience boolean.
 */
export function useMobileKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  /** The full viewport height when no keyboard is shown. */
  const initialHeightRef = useRef(0);

  const update = useCallback(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // Capture the initial height the first time (or when the keyboard is
    // definitely closed — i.e. visualViewport.height equals innerHeight).
    if (
      initialHeightRef.current === 0 ||
      vv.height >= window.innerHeight
    ) {
      initialHeightRef.current = vv.height;
    }

    // The keyboard height is the difference between the initial viewport
    // height and the current visual viewport height.
    const kbHeight = Math.max(
      0,
      Math.round(initialHeightRef.current - vv.height),
    );

    // Only treat it as "open" if the difference is meaningful (> 100px)
    // to avoid false positives from URL bar show/hide on Android.
    setKeyboardHeight(kbHeight > 100 ? kbHeight : 0);
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // Set the initial height immediately.
    initialHeightRef.current = vv.height;

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [update]);

  return {
    keyboardHeight,
    isKeyboardOpen: keyboardHeight > 0,
  };
}
