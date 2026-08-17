import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description:
      "AI-powered financial operating system for Nigeria. Track spending, budgets, and business cash flow in kobo.",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#FAFBFC",
    theme_color: "#0533CE",
    lang: "en-NG",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
