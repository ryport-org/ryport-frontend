import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { createMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createMetadata({
  path: "/",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden pt-[4.5rem] sm:pt-20">{children}</main>
      <SiteFooter />
    </>
  );
}
