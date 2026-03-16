import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "About Us | Direct Private Lender | 15+ Years Experience",
  description:
    "Southern Ground Capital is a direct private hard money lender with 15+ years of experience, $500M+ funded, and 1,200+ deals closed. Learn why investors trust us nationwide.",
  alternates: { canonical: "https://sgcapital.io/about" },
  openGraph: {
    title: "About Southern Ground Capital | Direct Private Lender",
    description: "$500M+ funded. 1,200+ deals. 15+ years. Your trusted hard money partner.",
    url: "https://sgcapital.io/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="sgc-amber-bar mb-6">
              <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Our Story</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">ABOUT<br />SOUTHERN GROUND<br />CAPITAL</h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              We&apos;re a direct private lender serving real estate investors nationwide. With over 15 years of experience and $500M+ in funded loans, we&apos;re the partner that moves as fast as you do.
            </p>
          </div>
        </section>
        <WhyChooseUs />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
