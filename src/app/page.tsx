import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { LoanPrograms } from "@/components/LoanPrograms";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { LoanCalculator } from "@/components/LoanCalculator";
import { Testimonials } from "@/components/Testimonials";
import { ServiceArea } from "@/components/ServiceArea";
import { BrokerSection } from "@/components/BrokerSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Southern Ground Capital | Hard Money Loans & Private Lending",
  description:
    "Fund your next real estate deal fast. Southern Ground Capital offers hard money loans with 24–48 hour approvals, competitive rates from 10.99%, and flexible terms nationwide.",
  alternates: {
    canonical: "https://sgcapital.io",
  },
};

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": "https://sgcapital.io/#organization",
      name: "Southern Ground Capital",
      url: "https://sgcapital.io",
      telephone: "+16788428084",
      email: "loans@sgcapital.io",
      description:
        "Southern Ground Capital is a direct private lender offering hard money loans for real estate investors nationwide. We specialize in fix & flip, DSCR, bridge, new construction, multi-family, and cash-out refinance loans.",
      areaServed: {
        "@type": "Country",
        name: "United States",
      },
      serviceType: [
        "Fix and Flip Loans",
        "DSCR Loans",
        "Bridge Loans",
        "New Construction Loans",
        "Multi-Family Loans",
        "Cash-Out Refinance",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://sgcapital.io/#org",
      name: "Southern Ground Capital",
      url: "https://sgcapital.io",
      logo: {
        "@type": "ImageObject",
        url: "https://sgcapital.io/og-image.jpg",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+16788428084",
        contactType: "customer service",
        availableLanguage: "English",
        hoursAvailable: "Mo-Fr 08:00-18:00",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <div className="min-h-screen">
        <Navbar />
        <main>
          <HeroSection />
          <LoanPrograms />
          <HowItWorks />
          <WhyChooseUs />
          <LoanCalculator />
          <Testimonials />
          <ServiceArea />
          <BrokerSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
