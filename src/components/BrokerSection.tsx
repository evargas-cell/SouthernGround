'use client';

/*
 * BrokerSection — Southern Ground Capital
 * Design: Industrial Precision — amber CTA banner for broker referrals
 */

import { ArrowRight, DollarSign, Users, Handshake } from "lucide-react";

export function BrokerSection() {
  const scrollToContact = () => {
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-[#162B52] relative overflow-hidden">
      {/* Background dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                Broker Program
              </span>
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-4">
              EARN MORE BY<br />
              <span className="text-[#E8A020]">BECOMING A BROKER</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md">
              Join the Southern Ground Capital broker network and earn competitive referral commissions on every deal you bring us. We close fast, pay promptly, and treat your clients right.
            </p>
            <button
              onClick={scrollToContact}
              className="btn-amber px-8 py-3.5 rounded-sm text-sm inline-flex items-center gap-2"
            >
              Become a Broker Partner
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Right: Benefits */}
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: DollarSign,
                title: "Competitive Commissions",
                description: "Earn up to 2% on every funded deal you refer to our network.",
              },
              {
                icon: Users,
                title: "Dedicated Support",
                description: "Your own account manager to help you close deals faster.",
              },
              {
                icon: Handshake,
                title: "Fast Closings",
                description: "We close in days, not weeks — keeping your clients happy.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-[#0A1628]/60 border border-[#E8A020]/15 rounded-sm p-5 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E8A020]/10 border border-[#E8A020]/30 flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-[#E8A020]" />
                  </div>
                  <h4 className="font-display text-white text-base mb-2">{item.title}</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrokerSection;
