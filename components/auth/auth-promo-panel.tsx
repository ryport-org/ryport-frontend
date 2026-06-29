import Link from "next/link";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

type AuthPromoPanelProps = {
  title: string;
  description: string;
};

export function AuthPromoPanel({ title, description }: AuthPromoPanelProps) {
  return (
    <div className="relative hidden overflow-hidden bg-ink lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 30%, rgba(61,139,255,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(234,242,255,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-md">
        <p className="text-sm font-medium text-sky">Ryport</p>
        <h2
          className="mt-4 font-display text-paper"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", lineHeight: 1.2 }}
        >
          {title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-mist">{description}</p>
      </div>

      <div className="relative z-10 mt-10 w-full max-w-lg self-center">
        <DashboardPreview />
      </div>
    </div>
  );
}

export function AuthFooter() {
  return (
    <footer className="mt-auto flex flex-col gap-2 border-t border-line pt-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
      <p>Copyright © 2025 Ryport Technologies Ltd</p>
      <Link href="/privacy" className="transition-colors hover:text-sky">
        Privacy Policy
      </Link>
    </footer>
  );
}
