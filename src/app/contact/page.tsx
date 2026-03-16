import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Contact Us | Get a Free Hard Money Loan Quote",
  description:
    "Contact Southern Ground Capital. Call (678) 842-8084 or submit your loan request online. Get a free, no-obligation quote within 24 hours.",
  alternates: { canonical: "https://sgcapital.io/contact" },
  openGraph: {
    title: "Contact Southern Ground Capital",
    description: "Call (678) 842-8084 or submit online. No-obligation quote in 24 hours.",
    url: "https://sgcapital.io/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">GET IN<br />TOUCH</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ready to fund your next deal? Contact our team for a free, no-obligation loan quote. We respond within 24 hours.
            </p>
          </div>
        </section>
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
