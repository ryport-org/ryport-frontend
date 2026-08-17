import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const SITE_NAME = "Ryport";
export const SITE_TAGLINE = "Smart Financial Intelligence for Nigeria";
export const DEFAULT_DESCRIPTION =
  "Understand, manage, and grow your finances with AI. Ryport connects Nigerian bank accounts via Mono, tracks every transaction in kobo, sets automated budgets, and delivers real-time AI CFO insights for individuals and businesses.";
export const DEFAULT_KEYWORDS = [
  "Ryport",
  "Nigerian fintech",
  "personal finance Nigeria",
  "budget app Nigeria",
  "AI CFO Nigeria",
  "open banking Nigeria",
  "Mono bank integration",
  "expense tracker Nigeria",
  "small business cash flow",
  "runway calculator Nigeria",
  "kobo accounting",
  "financial operating system",
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
  image = "/opengraph.png",
  noIndex = false,
  keywords = DEFAULT_KEYWORDS,
}: CreateMetadataOptions = {}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const imageUrl = absoluteUrl(image);

  return {
    metadataBase: new URL(APP_URL),
    title: {
      default: fullTitle,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords,
    applicationName: SITE_NAME,
    authors: [{ name: "Ryport Technologies", url: absoluteUrl() }],
    creator: "Ryport Technologies",
    publisher: "Ryport Technologies",
    category: "Finance & Accounting Software",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: url,
      languages: {
        "en-NG": url,
        "en-US": url,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      other: [
        { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_NG",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: "Ryport — Smart Financial Intelligence Platform for Nigeria",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      creator: "@ryport_ng",
      site: "@ryport_ng",
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    verification: {
      google: "google-site-verification-placeholder",
      yandex: "yandex-verification-placeholder",
      yahoo: "yahoo-verification-placeholder",
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": SITE_NAME,
      "mobile-web-app-capable": "yes",
      classification: "Finance Software",
      distribution: "Global",
      rating: "General",
      coverage: "Worldwide",
      "target-audience": "Individuals, Freelancers, SMEs",
      copyright: "© 2026 Ryport Technologies. All rights reserved.",
    },
  };
}

export const MARKETING_ROUTES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
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
