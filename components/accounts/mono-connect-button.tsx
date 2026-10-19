import { Button } from "@/components/ui/button";

type Props = {
  onCode?: (code: string) => void;
  disabled?: boolean;
};

export function MonoConnectButton({ disabled }: Props) {
  if (disabled) {
    return (
      <Button variant="primary" disabled>
        Bank Sync Paused
      </Button>
    );
  }

  return (
    <Button href="/app/transactions?new=1" variant="primary">
      Record Transaction
    </Button>
  );
}
