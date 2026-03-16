'use client';

/*
 * Footer — Southern Ground Capital
 * Design: Industrial Precision — deep navy footer with amber accents
 */

import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

const loanLinks = [
  { label: "Fix & Flip Loans", href: "/fix-and-flip-loans" },
  { label: "DSCR Loans", href: "/dscr-loans" },
  { label: "Bridge Loans", href: "/bridge-loans" },
  { label: "New Construction", href: "/new-construction-loans" },
  { label: "Multi-Family", href: "/multi-family-loans" },
  { label: "Cash-Out Refinance", href: "/cash-out-refinance" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
  { label: "Become a Broker", href: "/broker-program" },
];

export function Footer() {
  return (
    <footer className="bg-[#060E1A] border-t border-white/5">
      {/* CTA Banner */}
      <div className="bg-[#E8A020] py-5">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display text-[#0A1628] text-xl">READY TO CLOSE YOUR NEXT DEAL?</p>
            <p className="text-[#0A1628]/70 text-sm">Fast approvals. Flexible terms. Direct lender.</p>
          </div>
          <Link
            href="/contact"
            className="bg-[#0A1628] text-white font-display text-sm px-6 py-3 rounded-sm hover:bg-[#0F2040] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            Get a Free Quote
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center bg-[#E8A020]">
                <span className="font-display text-[#0A1628] text-lg leading-none">SG</span>
              </div>
              <div>
                <div className="font-display text-white text-base leading-tight tracking-wide">
                  SOUTHERN GROUND
                </div>
                <div className="text-[#E8A020] text-[10px] font-mono tracking-[0.2em] leading-tight uppercase">
                  Capital
                </div>
              </div>
            </Link>
            <p className="text-white/40 text-xs leading-relaxed mb-6">
              Southern Ground Capital is a direct private hard money lender serving real estate investors nationwide across the United States.
            </p>
            <div className="space-y-2">
              <a href="tel:+16788428084" className="flex items-center gap-2 text-white/50 hover:text-[#E8A020] text-xs transition-colors">
                <Phone size={12} />
                <span>(678) 842-8084</span>
              </a>
              <a href="mailto:loans@sgcapital.io" className="flex items-center gap-2 text-white/50 hover:text-[#E8A020] text-xs transition-colors">
                <Mail size={12} />
                <span>loans@sgcapital.io</span>
              </a>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <MapPin size={12} />
                <span>Nationwide (48 states)</span>
              </div>
            </div>
          </div>

          {/* Loan Programs */}
          <div>
            <h4 className="font-display text-white text-base mb-5 tracking-wide">LOAN PROGRAMS</h4>
            <ul className="space-y-2.5">
              {loanLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-[#E8A020] text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-white text-base mb-5 tracking-wide">COMPANY</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-[#E8A020] text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Area */}
          <div>
            <h4 className="font-display text-white text-base mb-5 tracking-wide">SERVICE AREA</h4>
            <p className="text-white/40 text-xs mb-3">Nationwide (excluding:)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Arizona", "Nevada", "N. Dakota", "Oregon",
                "S. Dakota", "Utah", "Vermont",
              ].map((state) => (
                <div key={state} className="text-[#E8A020]/60 text-xs">✕ {state}</div>
              ))}
            </div>
            <Link
              href="/#service-area"
              className="text-[#E8A020] text-xs mt-3 hover:text-[#F0B840] transition-colors block"
            >
              View Full Map →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Southern Ground Capital. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <button className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Privacy Policy
            </button>
            <button className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Terms of Service
            </button>
            <button className="text-white/25 hover:text-white/50 text-xs transition-colors">
              NMLS Disclosure
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#040A12] py-4">
        <div className="container">
          <p className="text-white/15 text-[10px] leading-relaxed text-center">
            Southern Ground Capital is a private money lender. All loans are for investment purposes only and are not available for owner-occupied residential properties. Loan approval is subject to underwriting criteria and property evaluation. Rates and terms are subject to change without notice. This is not an offer to lend. sgcapital.io
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
