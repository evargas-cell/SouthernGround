import type { Metadata } from "next";
import { RatesAndTerms } from "@/components/RatesAndTerms";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Rates & Terms | Hard Money Loan Programs Compared",
  description:
    "Compare Southern Ground Capital's hard money loan rates and terms across all programs: fix & flip, DSCR, bridge, new construction, multi-family, and cash-out refinance.",
  alternates: { canonical: "https://sgcapital.io/rates-and-terms" },
  openGraph: {
    title: "Rates & Terms | Southern Ground Capital",
    description: "Full rate and term matrix for all 6 hard money loan programs. Compare LTV, rates, fees, and terms side by side.",
    url: "https://sgcapital.io/rates-and-terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hard Money Loan Rates & Terms | Southern Ground Capital",
    description: "Compare rates, LTV, fees, and terms across all loan programs. Fix & flip, DSCR, bridge, construction, multi-family, cash-out.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
    { "@type": "ListItem", position: 2, name: "Rates & Terms", item: "https://sgcapital.io/rates-and-terms" },
  ],
};

export default function RatesAndTermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Transparent Pricing</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">RATES &amp;<br />TERMS</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              No hidden fees. No surprises. Compare rates, LTV limits, fees, and terms across all six of our hard money loan programs.
            </p>
          </div>
        </section>
        <RatesAndTerms />
        <ContactSection />
      </main>
    </>
  );
}
