"use client";

import { useEffect, useRef } from "react";
import { MONO_PUBLIC_KEY } from "@/lib/config";

type MonoConnectHandler = (code: string) => void;

declare global {
  interface Window {
    MonoConnect?: new (config: {
      key: string;
      onSuccess: (data: { code: string }) => void;
      onClose?: () => void;
    }) => { open: () => void };
  }
}

export function useMonoConnect(onSuccess: MonoConnectHandler) {
  const handlerRef = useRef(onSuccess);
  handlerRef.current = onSuccess;

  useEffect(() => {
    if (document.getElementById("mono-connect-script")) return;
    const script = document.createElement("script");
    script.id = "mono-connect-script";
    script.src = "https://connect.withmono.com/connect.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function openMono() {
    if (!MONO_PUBLIC_KEY) {
      alert("Mono public key not configured. Set NEXT_PUBLIC_MONO_PUBLIC_KEY.");
      return;
    }
    if (!window.MonoConnect) {
      alert("Mono Connect is still loading. Please try again.");
      return;
    }
    const instance = new window.MonoConnect({
      key: MONO_PUBLIC_KEY,
      onSuccess: ({ code }) => handlerRef.current(code),
    });
    instance.open();
  }

  return { openMono, isConfigured: Boolean(MONO_PUBLIC_KEY) };
}
