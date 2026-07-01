"use client";

import { useMonoConnect } from "@/lib/hooks/use-mono-connect";
import { Button } from "@/components/ui/button";

type Props = {
  onCode: (code: string) => void;
  disabled?: boolean;
};

export function MonoConnectButton({ onCode, disabled }: Props) {
  const { openMono, isConfigured } = useMonoConnect(onCode);

  return (
    <Button
      type="button"
      variant="primary"
      onClick={openMono}
      disabled={disabled || !isConfigured}
    >
      {isConfigured ? "Link bank with Mono" : "Mono key not set"}
    </Button>
  );
}
