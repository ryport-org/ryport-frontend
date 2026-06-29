import { AiInsightsSection } from "@/components/marketing/ai-insights-section";
import { BenefitsSection } from "@/components/marketing/benefits-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { ExploreSection } from "@/components/marketing/explore-section";
import { FeaturesGridSection } from "@/components/marketing/features-grid-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { IntegrationsStrip } from "@/components/marketing/integrations-strip";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ProductShowcaseSection } from "@/components/marketing/product-showcase-section";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { UpgradeScenarios } from "@/components/marketing/upgrade-scenarios";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntegrationsStrip />
      <HowItWorksSection />
      <ProductShowcaseSection />
      <BenefitsSection />
      <FeaturesGridSection />
      <AiInsightsSection />
      <PricingSection compact />
      <UpgradeScenarios />
      <TestimonialSection />
      <ExploreSection />
      <CtaSection />
    </>
  );
}
