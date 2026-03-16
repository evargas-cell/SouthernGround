import type { Metadata } from "next";
import { HowItWorks } from "@/components/HowItWorks";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "How It Works | Get Funded in 4 Simple Steps",
  description:
    "Learn how Southern Ground Capital approves and funds hard money loans. Submit your request, speak with a specialist, receive your term sheet, and close — in as little as 5 days.",
  alternates: { canonical: "https://sgcapital.io/how-it-works" },
  openGraph: {
    title: "How It Works | Southern Ground Capital",
    description: "4 simple steps from application to funding. As fast as 5 days.",
    url: "https://sgcapital.io/how-it-works",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works | Southern Ground Capital Hard Money Loans",
    description: "From application to funded in as little as 5 business days. 4 simple steps.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://sgcapital.io" },
    { "@type": "ListItem", position: 2, name: "How It Works", item: "https://sgcapital.io/how-it-works" },
  ],
};

export default function HowItWorksPage() {
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
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Simple Process</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">HOW IT WORKS</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From application to funding in as little as 5 business days. Here&apos;s exactly what to expect when you work with Southern Ground Capital.
            </p>
          </div>
        </section>
        <HowItWorks />
        <ContactSection />
      </main>
    </>
  );
}
