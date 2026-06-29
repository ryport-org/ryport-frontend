import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Insights", href: "/ai-insights" },
    { label: "Integrations", href: "/integrations" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Customers", href: "/customers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
              AI-powered Financial Operating System for Nigeria. From personal
              finance to AI CFO.
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-sm font-medium text-ink">{group}</p>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-mist transition-colors hover:text-sky"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-mist">© 2025 Ryport Technologies Ltd</p>
          <p className="text-sm text-mist">ryport.com.ng</p>
        </div>
      </div>
    </footer>
  );
}
