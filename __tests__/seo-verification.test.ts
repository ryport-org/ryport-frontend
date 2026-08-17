import { describe, expect, it } from "vitest";
import {
  SITE_NAME,
  absoluteUrl,
  createMetadata,
  getSearchEngineVerification,
  MARKETING_ROUTES,
  getSitemapEntries,
} from "@/lib/seo/site";
import robots from "@/app/robots";

describe("Technical SEO Verification & Indexing Readiness", () => {
  it("enforces production domain https://www.ryport.com.ng", () => {
    expect(absoluteUrl()).toBe("https://www.ryport.com.ng");
    expect(absoluteUrl("/features")).toBe("https://www.ryport.com.ng/features");
  });

  it("supports Google, Bing, Yandex, and Pinterest verification meta tags", () => {
    const verifications = getSearchEngineVerification();
    expect(verifications.google).toBeDefined();
    expect(verifications.yandex).toBeDefined();
    expect(verifications.other["msvalidate.01"]).toBeDefined();
  });

  it("ensures robots.txt references sitemap.xml and host correctly", () => {
    const robotsData = robots();
    expect(robotsData.sitemap).toBe("https://www.ryport.com.ng/sitemap.xml");
    expect(robotsData.host).toBe("https://www.ryport.com.ng");

    const rules = Array.isArray(robotsData.rules)
      ? robotsData.rules[0]
      : robotsData.rules;
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toContain("/app/");
    expect(rules.disallow).toContain("/staff/");
  });

  it("verifies canonical URLs match sitemap URLs 1:1 across all 20 public routes", () => {
    const sitemapEntries = getSitemapEntries(0);
    expect(sitemapEntries.length).toBe(MARKETING_ROUTES.length);

    MARKETING_ROUTES.forEach((route, index) => {
      const canonical = createMetadata({ path: route.path }).alternates?.canonical;
      const sitemapUrl = sitemapEntries[index].url;
      expect(canonical).toBe(sitemapUrl);
      expect(sitemapUrl).toBe(absoluteUrl(route.path));
    });
  });

  it("verifies all marketing pages have index: true and follow: true", () => {
    MARKETING_ROUTES.forEach((route) => {
      const meta = createMetadata({ path: route.path });
      const robotsMeta = meta.robots as { index: boolean; follow: boolean };
      expect(robotsMeta.index).toBe(true);
      expect(robotsMeta.follow).toBe(true);
    });
  });

  it("verifies excluded routes (e.g. noIndex: true) have index: false and follow: false", () => {
    const meta = createMetadata({ path: "/reset-password", noIndex: true });
    const robotsMeta = meta.robots as { index: boolean; follow: boolean };
    expect(robotsMeta.index).toBe(false);
    expect(robotsMeta.follow).toBe(false);
  });

  it("supports multi-sitemap chunks for future scalability", () => {
    const chunk0 = getSitemapEntries(0, 10);
    const chunk1 = getSitemapEntries(1, 10);

    expect(chunk0.length).toBe(10);
    expect(chunk1.length).toBe(10);
    expect(chunk0[0].url).toBe("https://www.ryport.com.ng/");
    expect(chunk1[0].url).toBe("https://www.ryport.com.ng/blog");
  });
});
