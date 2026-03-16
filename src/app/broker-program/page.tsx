import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrokerSection } from "@/components/BrokerSection";
import { ContactSection } from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Broker Program | Earn Up to 2% Per Deal",
  description:
    "Join the Southern Ground Capital broker network. Earn up to 2% per closed loan, get dedicated support, and close deals in days. Sign up for our broker partner program today.",
  alternates: { canonical: "https://sgcapital.io/broker-program" },
  openGraph: {
    title: "Broker Program | Southern Ground Capital",
    description: "Earn up to 2% per deal. Dedicated support. Fast closings.",
    url: "https://sgcapital.io/broker-program",
  },
};

export default function BrokerProgramPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="sgc-section-dark py-20 pt-32">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-display text-5xl md:text-6xl text-white mb-6">BROKER<br />PROGRAM</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Partner with Southern Ground Capital and earn competitive commissions on every closed deal. We provide the tools, support, and speed your clients demand.
            </p>
          </div>
        </section>
        <BrokerSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
