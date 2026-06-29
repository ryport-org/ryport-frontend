export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export type NavMenu = {
  label: string;
  items: NavItem[];
};

export const navMenus: NavMenu[] = [
  {
    label: "Product",
    items: [
      {
        href: "/features",
        label: "Features",
        description: "Dashboards, capture, and health scores",
      },
      {
        href: "/dashboard",
        label: "Dashboard",
        description: "Revenue, cash flow, and trends at a glance",
      },
      {
        href: "/ai-insights",
        label: "AI Insights",
        description: "Plain-English summaries of your numbers",
      },
      {
        href: "/integrations",
        label: "Integrations",
        description: "Connect banks and tools you already use",
      },
      {
        href: "/pricing",
        label: "Pricing",
        description: "Free forever — upgrade when you're ready",
      },
    ],
  },
  {
    label: "Solutions",
    items: [
      {
        href: "/solutions/small-business",
        label: "Small business",
        description: "Clarity without an accounting team",
      },
      {
        href: "/solutions/freelancers",
        label: "Freelancers",
        description: "Track income and expenses in one place",
      },
      {
        href: "/solutions/agencies",
        label: "Agencies",
        description: "Project revenue and team spending",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        href: "/blog",
        label: "Blog",
        description: "Guides on cash flow and growth",
      },
      {
        href: "/customers",
        label: "Customers",
        description: "Stories from founders like you",
      },
      {
        href: "/contact",
        label: "Contact",
        description: "Talk to our team",
      },
    ],
  },
  {
    label: "Company",
    items: [
      {
        href: "/why-ryport",
        label: "Why Ryport",
        description: "What makes us different",
      },
      {
        href: "/about",
        label: "About",
        description: "Our mission and story",
      },
      {
        href: "/security",
        label: "Security",
        description: "How we protect your data",
      },
    ],
  },
];

export function isNavActive(pathname: string, menu: NavMenu) {
  return menu.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
