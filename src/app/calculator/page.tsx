import type { Metadata } from "next";
import { LoanCalculator } from "@/components/LoanCalculator";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Hard Money Loan Calculator | Estimate Your Costs",
  description:
    "Use Southern Ground Capital's free hard money loan calculator to estimate monthly interest, total loan cost, and origination fees. Adjust loan amount, rate, and term instantly.",
  alternates: { canonical: "https://sgcapital.io/calculator" },
  openGraph: {
    title: "Hard Money Loan Calculator | Southern Ground Capital",
    description: "Estimate monthly interest and total loan cost in seconds. Free, no sign-up required.",
    url: "https://sgcapital.io/calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hard Money Loan Calculator | Southern Ground Capital",
    description: "Instantly estimate your hard money loan costs. Adjust loan amount, rate, and term.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
    { "@type": "ListItem", position: 2, name: "Loan Calculator", item: "https://sgcapital.io/calculator" },
  ],
};

export default function CalculatorPage() {
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
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Free Tool</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">LOAN CALCULATOR</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Estimate your monthly interest payments and total loan cost in seconds. Adjust loan amount, interest rate, and term to model your deal.
            </p>
          </div>
        </section>
        <LoanCalculator />
        <ContactSection />
      </main>
    </>
  );
}
