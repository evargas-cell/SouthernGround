import type { Metadata } from "next";
import { ContactSection } from "@/components/ContactSection";
import { Testimonials } from "@/components/Testimonials";
import { HowItWorks } from "@/components/HowItWorks";
import { RelatedPrograms } from "@/components/RelatedPrograms";

export const metadata: Metadata = {
  title: "New Construction Loans | Ground-Up Construction Financing",
  description:
    "New construction loans from Southern Ground Capital. Up to 85% LTC, flexible draw schedules, 12–24 month terms. Fund your ground-up build from land to CO.",
  alternates: { canonical: "https://sgcapital.io/new-construction-loans" },
  openGraph: {
    title: "New Construction Loans | Southern Ground Capital",
    description: "Up to 85% LTC. Flexible draws. Min loan $150,000.",
    url: "https://sgcapital.io/new-construction-loans",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Construction Loans | 85% LTC | Southern Ground Capital",
    description:
      "Ground-up construction financing. Up to 85% LTC, flexible draw schedules, 12–24 month terms. $150K minimum loan.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LoanOrCredit",
      name: "New Construction Loan",
      provider: { "@type": "FinancialService", name: "Southern Ground Capital" },
      description:
        "Ground-up construction financing for residential and light commercial developers.",
      amount: { "@type": "MonetaryAmount", minValue: 150000, currency: "USD" },
      loanTerm: { "@type": "QuantitativeValue", minValue: 12, maxValue: 24, unitCode: "MON" },
      loanType: "Construction Loan",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
        {
          "@type": "ListItem",
          position: 2,
          name: "New Construction Loans",
          item: "https://sgcapital.io/new-construction-loans",
        },
      ],
    },
  ],
};

export default function NewConstructionLoansPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="sgc-amber-bar mb-6">
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Loan Program</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">NEW<br />CONSTRUCTION<br />LOANS</h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10">
              Ground-up construction financing for builders and developers. We fund from land acquisition through certificate of occupancy with flexible draw schedules.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: "Max LTC", value: "85%" },
                { label: "Term", value: "12–24 Mo" },
                { label: "Draw Schedule", value: "Flexible" },
                { label: "Min Loan", value: "$150K" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg p-5 text-center">
                  <div className="font-mono-nums text-3xl text-amber-400 mb-1">{s.value}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">LOAN DETAILS</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan-to-Cost (LTC)</span><span className="text-amber-400 font-semibold">Up to 85%</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Loan Term</span><span className="text-amber-400 font-semibold">12–24 Months</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Draw Schedule</span><span className="text-amber-400 font-semibold">Flexible</span></li>
                  <li className="flex justify-between border-b border-white/10 pb-2"><span>Min Loan Amount</span><span className="text-amber-400 font-semibold">$150,000</span></li>
                  <li className="flex justify-between"><span>Property Types</span><span className="text-amber-400 font-semibold">SFR, Townhomes, ADUs</span></li>
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h2 className="font-display text-2xl text-white mb-4">WHO IT&apos;S FOR</h2>
                <ul className="space-y-3 text-gray-300">
                  {[
                    "Residential builders and developers",
                    "Infill lot developers",
                    "ADU and accessory structure builds",
                    "Tear-down and rebuild projects",
                    "Spec home construction",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        <HowItWorks />
        <Testimonials />
        <RelatedPrograms exclude="/new-construction-loans" />
        <ContactSection defaultLoanType="New Construction" />
      </main>
    </>
  );
}
