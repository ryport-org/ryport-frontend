import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapEntries(0);
}
