import Link from "next/link";
import { getAiUpgradeHref } from "@/lib/ai/errors";

export function AiUpgradeLink({ error }: { error: unknown }) {
  const href = getAiUpgradeHref(error);
  if (!href) return null;
  return (
    <Link href={href} className="font-semibold text-sky hover:underline">
      Upgrade plan
    </Link>
  );
}
