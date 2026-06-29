import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const exploreLinks = [
  {
    group: "Product",
    links: [
      { href: "/features", label: "Features", desc: "Full capability overview" },
      { href: "/dashboard", label: "Dashboard", desc: "Real-time financial view" },
      { href: "/ai-insights", label: "AI Insights", desc: "Plain-English summaries" },
      { href: "/integrations", label: "Integrations", desc: "Banks & payment tools" },
    ],
  },
  {
    group: "Solutions",
    links: [
      { href: "/solutions/small-business", label: "Small business", desc: "Clarity without overhead" },
      { href: "/solutions/freelancers", label: "Freelancers", desc: "Irregular income, solved" },
      { href: "/solutions/agencies", label: "Agencies", desc: "Project & team finances" },
    ],
  },
  {
    group: "Company",
    links: [
      { href: "/why-ryport", label: "Why Ryport", desc: "Our approach" },
      { href: "/about", label: "About", desc: "Mission & story" },
      { href: "/customers", label: "Customers", desc: "Real stories" },
      { href: "/contact", label: "Contact", desc: "Talk to us" },
    ],
  },
  {
    group: "Get started",
    links: [
      { href: "/register", label: "Create account", desc: "Free — ₦0/mo" },
      { href: "/pricing", label: "Pricing", desc: "Free · Pro · Advanced" },
      { href: "/login", label: "Sign in", desc: "Welcome back" },
      { href: "/security", label: "Security", desc: "How we protect data" },
    ],
  },
];

export function ExploreSection() {
  return (
    <section id="explore" className="scroll-mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-sky">Explore</p>
          <h2 className="mt-3 font-display text-2xl text-ink">Everything Ryport offers</h2>
          <p className="mt-2 text-sm text-mist">Jump to any page — no hunting through menus.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {exploreLinks.map((group) => (
            <div key={group.group}>
              <h3 className="text-sm font-semibold text-ink">{group.group}</h3>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-start justify-between gap-2 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-line hover:bg-white"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink group-hover:text-sky">
                          {link.label}
                        </p>
                        <p className="text-xs text-mist">{link.desc}</p>
                      </div>
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-mist opacity-0 transition-opacity group-hover:text-sky group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
