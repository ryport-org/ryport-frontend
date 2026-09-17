import { Button } from "@/components/ui/button";

type Props = {
  onCode?: (code: string) => void;
  disabled?: boolean;
};

export function MonoConnectButton({ disabled }: Props) {
  if (disabled) {
    return (
      <Button variant="primary" disabled>
        Import from SMS
      </Button>
    );
  }

  return (
    <Button
      href="/app/transactions/sms-import"
      variant="primary"
    >
      Import from SMS
    </Button>
  );
}
