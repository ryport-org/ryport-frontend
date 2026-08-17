import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl()}#organization`,
    name: SITE_NAME,
    url: absoluteUrl(),
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/opengraph.png"),
    description:
      "Ryport is Nigeria's premier financial intelligence platform for individuals, freelancers, and SMEs. Track expenses, automate kobo accounting, calculate runway, and chat with AI CFO assistant.",
    foundingDate: "2024",
    areaServed: "NG",
    sameAs: [
      "https://twitter.com/ryport_ng",
      "https://linkedin.com/company/ryport",
      "https://instagram.com/ryport.ng",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+234-800-RYPORT",
      contactType: "customer service",
      areaServed: "NG",
      availableLanguage: ["English"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl()}#website`,
    url: absoluteUrl(),
    name: SITE_NAME,
    description: "AI-Powered Financial Operating System for Nigeria",
    publisher: {
      "@id": `${absoluteUrl()}#organization`,
    },
    inLanguage: "en-NG",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl()}/features?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "FinanceApplication",
    url: absoluteUrl(),
    image: absoluteUrl("/opengraph.png"),
    description:
      "Understand, manage, and grow your finances with AI. Connect Nigerian bank accounts via Mono, track spending in kobo, and get real-time cash flow runway calculations.",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "NGN",
        name: "Free Tier",
        description: "2 linked bank accounts, 10 AI CFO questions per day",
      },
      {
        "@type": "Offer",
        price: "5000",
        priceCurrency: "NGN",
        name: "Pro Tier",
        description: "5 linked bank accounts, unlimited AI chat, 30-day cash flow forecast",
      },
      {
        "@type": "Offer",
        price: "15000",
        priceCurrency: "NGN",
        name: "Advanced Tier",
        description: "Unlimited bank accounts, SME team cash flow, automated tax readiness",
      },
    ],
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Ryport?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ryport is an AI-powered financial operating system tailored for Nigerians. It connects bank accounts via Mono, categorizes transactions automatically in kobo, calculates runway for businesses, and provides conversational AI CFO insights.",
        },
      },
      {
        "@type": "Question",
        name: "How does Ryport connect to Nigerian bank accounts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ryport integrates directly with Mono, Nigeria's leading open banking provider, supporting major commercial banks including GTBank, Zenith, Access, Kuda, FirstBank, and UBA using read-only bank-grade encryption.",
        },
      },
      {
        "@type": "Question",
        name: "Is my financial data safe with Ryport?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Ryport uses 256-bit AES end-to-end encryption, read-only open banking connections, 2FA authentication, and zero plain-text storage of credentials.",
        },
      },
      {
        "@type": "Question",
        name: "How much does Ryport cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ryport offers a 100% Free plan forever (₦0/mo), a Pro plan at ₦5,000/mo for power users and freelancers, and an Advanced plan at ₦15,000/mo for growing SMEs.",
        },
      },
    ],
  };
}

type JsonLdProps = {
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps = {}) {
  const schemas = data
    ? Array.isArray(data)
      ? data
      : [data]
    : [organizationJsonLd(), websiteJsonLd(), softwareApplicationJsonLd(), faqJsonLd()];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
