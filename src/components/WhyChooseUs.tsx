'use client';

/*
 * WhyChooseUs — Southern Ground Capital
 * Design: Industrial Precision — dark section with stats and differentiators
 * Uses handshake image as background element
 */

import { useEffect, useRef, useState } from "react";
import { Zap, Shield, Users, MapPin, Clock, Award } from "lucide-react";

const HANDSHAKE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/95558444/SRpei9L9RnhAsFaEksuafb/sgc-handshake-UHfyn7uoeyNXkwfiFQ3n7n.webp";

const stats = [
  { value: 500, suffix: "M+", label: "Total Loans Funded", prefix: "$" },
  { value: 1200, suffix: "+", label: "Deals Closed", prefix: "" },
  { value: 48, suffix: "hr", label: "Average Approval Time", prefix: "" },
  { value: 98, suffix: "%", label: "Borrower Satisfaction", prefix: "" },
];

const differentiators = [
  {
    icon: Zap,
    title: "Speed You Can Count On",
    description:
      "We understand that in real estate, timing is everything. Our streamlined process gets you from application to funding in days, not weeks.",
  },
  {
    icon: Shield,
    title: "Direct Lender — No Middlemen",
    description:
      "Southern Ground Capital is a direct private lender. We make our own decisions, which means faster approvals and no broker fees eating into your returns.",
  },
  {
    icon: Users,
    title: "Dedicated Loan Specialists",
    description:
      "Every borrower is assigned a dedicated specialist who knows your deal inside and out. Real people, real answers — not a call center.",
  },
  {
    icon: MapPin,
    title: "Nationwide Lending",
    description:
      "We lend across the United States, bringing the same speed and expertise to every market. Wherever your deal is, we're there — coast to coast.",
  },
  {
    icon: Clock,
    title: "Flexible Terms",
    description:
      "Cookie-cutter loans don't work for every deal. We offer flexible terms, creative structures, and common-sense underwriting.",
  },
  {
    icon: Award,
    title: "Proven Track Record",
    description:
      "Over $500M in funded loans across hundreds of projects. Our borrowers come back deal after deal because we deliver on our promises.",
  },
];

function AnimatedNumber({ target, prefix, suffix }: { target: number; prefix: string; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="font-mono-nums text-[#E8A020] text-4xl md:text-5xl">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

export function WhyChooseUs() {
  return (
    <section id="about" className="py-24 bg-[#0F2040]">
      <div className="container">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 pb-16 border-b border-white/10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedNumber target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              <div className="text-white/50 text-xs mt-2 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image */}
          <div className="relative">
            <div className="relative rounded-sm overflow-hidden">
              <img
                src={HANDSHAKE_IMAGE}
                alt="Southern Ground Capital partnership"
                className="w-full h-80 lg:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2040]/60 to-transparent" />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-6 bg-[#E8A020] p-6 rounded-sm shadow-2xl hidden md:block">
              <div className="font-display text-[#0A1628] text-3xl leading-none">15+</div>
              <div className="text-[#0A1628]/70 text-xs font-mono tracking-wider mt-1">Years Experience</div>
            </div>
            {/* Amber border accent */}
            <div className="absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 border-[#E8A020] rounded-tl-sm" />
          </div>

          {/* Right: Why Choose Us */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                Why Southern Ground Capital
              </span>
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-6">
              YOUR DEAL DESERVES<br />
              <span className="text-[#E8A020]">A REAL PARTNER</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              We're not a bank. We're not a broker. Southern Ground Capital is a direct private lender built specifically for real estate investors who need speed, flexibility, and a team that understands the deal.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {differentiators.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={15} className="text-[#E8A020]" />
                    </div>
                    <div>
                      <h4 className="font-display text-white text-base leading-tight mb-1">
                        {item.title}
                      </h4>
                      <p className="text-white/50 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
