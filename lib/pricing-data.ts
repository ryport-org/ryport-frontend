export type PlanTier = "free" | "pro" | "advanced";

export type Plan = {
  id: PlanTier;
  name: string;
  price: string;
  period: string;
  tagline: string;
  idealFor: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "₦0",
    period: "/ month · forever",
    tagline: "Your financial journey starts here",
    idealFor: "Students · Individuals · First-time budgeters",
    description:
      "A real-time snapshot of your financial health with AI categorisation and 2 bank account connections.",
    features: [
      "Financial dashboard",
      "Manual expense & income tracking",
      "AI transaction categorisation",
      "2 bank account connections",
      "AI chat — 10 messages/day",
      "Monthly financial report",
      "Basic budget planning",
    ],
    cta: "Start free",
    href: "/register",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₦5,000",
    period: "/ month",
    tagline: "Your intelligent financial co-pilot",
    idealFor: "Professionals · Freelancers · Ambitious individuals",
    description:
      "Unlimited AI, smart budgets, cash flow prediction, receipt scanning, and exports.",
    features: [
      "Everything in Free",
      "Unlimited AI chat",
      "Smart AI budget recommendations",
      "Subscription detection & bill reminders",
      "Cash flow prediction",
      "Receipt scanner (AI)",
      "Export reports (PDF, CSV, Excel)",
    ],
    cta: "Upgrade to Pro",
    href: "/register",
    highlighted: true,
  },
  {
    id: "advanced",
    name: "Advanced",
    price: "₦15,000",
    period: "/ month",
    tagline: "Your AI CFO",
    idealFor: "Founders · Startups · SMEs · Finance teams",
    description:
      "Business intelligence, AI CFO, team collaboration, multi-business, and API access.",
    features: [
      "Everything in Pro",
      "Business dashboard & P&L reports",
      "AI CFO — runway, burn rate, risks",
      "Revenue analytics",
      "Team collaboration & roles",
      "Multi-business management",
      "API access & priority support",
    ],
    cta: "Go Advanced",
    href: "/register",
    highlighted: false,
  },
];

export type ComparisonCell = boolean | string;

export type ComparisonRow = {
  feature: string;
  free: ComparisonCell;
  pro: ComparisonCell;
  advanced: ComparisonCell;
  group?: string;
};

export const comparisonRows: ComparisonRow[] = [
  { group: "Dashboard & tracking", feature: "", free: false, pro: false, advanced: false },
  { feature: "Financial dashboard", free: true, pro: true, advanced: true },
  { feature: "Manual expense & income tracking", free: true, pro: true, advanced: true },
  { feature: "AI transaction categorisation", free: true, pro: true, advanced: true },
  { feature: "Bank connections", free: "2 accounts", pro: "Unlimited", advanced: "Unlimited" },
  { group: "AI intelligence", feature: "", free: false, pro: false, advanced: false },
  { feature: "AI chat assistant", free: "10/day", pro: "Unlimited", advanced: "Unlimited" },
  { feature: "Smart AI budget", free: false, pro: true, advanced: true },
  { feature: "Cash flow prediction", free: false, pro: true, advanced: true },
  { feature: "AI CFO (full suite)", free: false, pro: false, advanced: true },
  { group: "Reports & exports", feature: "", free: false, pro: false, advanced: false },
  { feature: "Monthly financial report", free: true, pro: true, advanced: true },
  { feature: "Weekly AI summary", free: false, pro: true, advanced: true },
  { feature: "Profit & loss reports", free: false, pro: false, advanced: true },
  { feature: "Export PDF, CSV, Excel", free: false, pro: true, advanced: true },
  { group: "Automation", feature: "", free: false, pro: false, advanced: false },
  { feature: "Subscription detection", free: false, pro: true, advanced: true },
  { feature: "Bill reminders & budget alerts", free: false, pro: true, advanced: true },
  { feature: "Receipt scanner (AI)", free: false, pro: true, advanced: true },
  { group: "Business", feature: "", free: false, pro: false, advanced: false },
  { feature: "Business dashboard & KPIs", free: false, pro: false, advanced: true },
  { feature: "Team collaboration", free: false, pro: false, advanced: true },
  { feature: "Multi-business management", free: false, pro: false, advanced: true },
  { feature: "API access", free: false, pro: false, advanced: true },
  { feature: "Priority support", free: false, pro: false, advanced: true },
];

export const upgradeScenarios = [
  {
    name: "Amara (Student Scenario)",
    role: "Illustrative scenario · Student budgeting",
    plan: "Free",
    story:
      "Example scenario: Tracking a ₦35,000 monthly allowance. AI categorisation highlights food & subscription breakdown so users can target savings goals.",
  },
  {
    name: "Tunde (Freelancer Scenario)",
    role: "Illustrative scenario · Solo contractor",
    plan: "Pro",
    story:
      "Example scenario: Managing fluctuating monthly income. Cash flow forecasting aids liquidity planning while automated subscription detection flags recurring charges.",
  },
  {
    name: "Chidinma (SME Founder Scenario)",
    role: "Illustrative scenario · SME Operations",
    plan: "Advanced",
    story:
      "Example scenario: Monitoring monthly business revenue & operating expenses. Executive AI CFO analytics track runway months, burn rate, and cost anomalies with team permission controls.",
  },
];

export const pillars = [
  {
    title: "Understand",
    description:
      "Know exactly where every naira goes with AI categorisation and real-time insights.",
  },
  {
    title: "Manage",
    description:
      "Set smart budgets, track goals, and get proactive alerts before problems arise.",
  },
  {
    title: "Grow",
    description:
      "Use your financial data as a strategic asset with AI CFO insights and business analytics.",
  },
];
