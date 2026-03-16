'use client';

/*
 * Navbar — Southern Ground Capital
 * Design: Industrial Precision — dark navy, amber accent
 * Sticky top nav with logo, loan programs dropdown, and CTA button
 */

import { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";

const loanPrograms = [
  {
    label: "Fix & Flip Loans",
    href: "/fix-and-flip-loans",
    desc: "Up to 90% LTC · 75% ARV · From 10.99%",
  },
  {
    label: "DSCR Loans",
    href: "/dscr-loans",
    desc: "30-year terms · 80% LTV · No income docs",
  },
  {
    label: "Bridge Loans",
    href: "/bridge-loans",
    desc: "3–24 months · 75% LTV · Fast close",
  },
  {
    label: "New Construction",
    href: "/new-construction-loans",
    desc: "85% LTC · Flexible draws · $150K min",
  },
  {
    label: "Multi-Family Loans",
    href: "/multi-family-loans",
    desc: "2–20 units · 75% LTV · 10–14 day close",
  },
  {
    label: "Cash-Out Refinance",
    href: "/cash-out-refinance",
    desc: "70% LTV · 30% equity · No income check",
  },
];

const mainNavLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A1628]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-sm flex items-center justify-center bg-[#E8A020] group-hover:bg-[#F0B840] transition-colors">
              <span className="font-display text-[#0A1628] text-lg leading-none">SG</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-white text-lg leading-tight tracking-wide">
                SOUTHERN GROUND
              </div>
              <div className="text-[#E8A020] text-[10px] font-mono tracking-[0.2em] leading-tight uppercase">
                Capital
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* Loan Programs Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProgramsOpen(true)}
              onMouseLeave={() => setProgramsOpen(false)}
            >
              <button
                className="nav-link text-sm flex items-center gap-1"
                onClick={() => setProgramsOpen(!programsOpen)}
                aria-expanded={programsOpen}
                aria-haspopup="true"
              >
                Loan Programs
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${programsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {programsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72">
                  <div className="bg-[#0F2040] border border-[#E8A020]/20 rounded-sm shadow-[0_16px_48px_rgba(0,0,0,0.6)] py-2">
                    <div className="px-4 py-2 mb-1 border-b border-white/10">
                      <span className="text-[#E8A020] text-[10px] font-mono tracking-widest uppercase">
                        Our Loan Products
                      </span>
                    </div>
                    {loanPrograms.map((program) => (
                      <Link
                        key={program.href}
                        href={program.href}
                        onClick={() => setProgramsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="text-white text-sm font-medium group-hover:text-[#E8A020] transition-colors">
                          {program.label}
                        </div>
                        <div className="text-white/40 text-xs mt-0.5">{program.desc}</div>
                      </Link>
                    ))}
                    <div className="px-4 pt-2 mt-1 border-t border-white/10">
                      <Link
                        href="/contact"
                        onClick={() => setProgramsOpen(false)}
                        className="flex items-center gap-1.5 text-[#E8A020] text-xs font-semibold hover:text-[#F0B840] transition-colors"
                      >
                        Get a Free Quote <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {mainNavLinks.map((link) => (
              <Link key={link.label} href={link.href} className="nav-link text-sm">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+16788428084"
              className="flex items-center gap-2 text-[#E8A020] text-sm font-medium hover:text-[#F0B840] transition-colors"
            >
              <Phone size={14} />
              <span className="font-mono text-xs tracking-wider">(678) 842-8084</span>
            </a>
            <Link href="/contact" className="btn-amber px-5 py-2.5 rounded-sm text-sm">
              Get a Quote
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0A1628]/98 backdrop-blur-md border-t border-[#E8A020]/20">
          <div className="container py-6 flex flex-col gap-1">
            {/* Mobile Loan Programs Accordion */}
            <button
              onClick={() => setMobileProgramsOpen(!mobileProgramsOpen)}
              className="flex items-center justify-between w-full text-white/80 hover:text-[#E8A020] font-medium py-2 border-b border-white/10 transition-colors"
            >
              <span>Loan Programs</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${mobileProgramsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileProgramsOpen && (
              <div className="pl-4 py-2 space-y-1 bg-white/5 rounded-sm mb-1">
                {loanPrograms.map((program) => (
                  <Link
                    key={program.href}
                    href={program.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-white/70 hover:text-[#E8A020] text-sm py-1.5 transition-colors"
                  >
                    {program.label}
                  </Link>
                ))}
              </div>
            )}

            {mainNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-left text-white/80 hover:text-[#E8A020] font-medium py-2 border-b border-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="btn-amber px-5 py-3 rounded-sm text-sm mt-3 text-center"
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
