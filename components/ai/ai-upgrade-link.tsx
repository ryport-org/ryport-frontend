import Link from "next/link";
import { getAiUpgradeHref } from "@/lib/ai/errors";

export function AiUpgradeLink({ error }: { error: unknown }) {
  const href = getAiUpgradeHref(error);
  if (!href) return null;
  return (
    <Link href="/app/upgrade" className="font-semibold text-mist opacity-60 hover:underline">
      Coming soon
    </Link>
  );
}
