import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const SITE_NAME = "Ryport";
export const SITE_TAGLINE = "AI-Powered Financial Operating System";
export const DEFAULT_DESCRIPTION =
  "Understand, manage, and grow your finances with AI. Ryport connects Nigerian bank accounts, tracks every transaction in kobo, sets budgets, and delivers AI-powered CFO insights for individuals and businesses.";
export const DEFAULT_KEYWORDS = [
  "personal finance Nigeria",
  "budget app Nigeria",
  "AI financial assistant",
  "open banking Nigeria",
  "expense tracker Nigeria",
  "small business finance",
  "AI CFO Nigeria",
  "Ryport",
  "kobo accounting",
  "Mono bank integration",
];

export function absoluteUrl(path = ""): string {
  const base = APP_URL.replace(/\/+$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type CreateMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
};

export function createMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = "/logo.png",
  noIndex = false,
  keywords = DEFAULT_KEYWORDS,
}: CreateMetadataOptions = {}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title: fullTitle,
    description,
    keywords,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_NG",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ url: imageUrl, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const MARKETING_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/features", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/why-ryport", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ai-insights", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/integrations", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/security", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/customers", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/dashboard", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/solutions/small-business", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/solutions/freelancers", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/solutions/agencies", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/login", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/register", priority: 0.5, changeFrequency: "monthly" as const },
];
