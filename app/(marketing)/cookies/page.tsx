import type { Metadata } from "next";
import { ContentHeading, ContentSection } from "@/components/marketing/content-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Cookie Policy — Ryport",
};

export default function CookiesPage() {
  return (
    <>
      <PageHero title="Cookie Policy" description="Last updated: June 2026" />
      <ContentSection>
        <ContentHeading>What are cookies?</ContentHeading>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help us remember your preferences and improve your
          experience.
        </p>

        <ContentHeading>How we use cookies</ContentHeading>
        <p>
          We use essential cookies to keep you signed in and functional cookies
          to understand how the product is used. We do not use cookies for
          third-party advertising.
        </p>

        <ContentHeading>Managing cookies</ContentHeading>
        <p>
          You can control cookies through your browser settings. Disabling
          essential cookies may affect your ability to use Ryport.
        </p>
      </ContentSection>
    </>
  );
}
