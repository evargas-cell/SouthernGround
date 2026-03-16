/*
 * Navbar — Southern Ground Capital
 * Design: Industrial Precision — dark navy, amber accent
 * Sticky top nav with logo, links, and CTA button
 */

import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "Loan Programs", href: "#loan-programs" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About Us", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
          <a
            href="#"
            className="flex items-center gap-3 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
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
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="nav-link text-sm"
              >
                {link.label}
              </button>
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
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-amber px-5 py-2.5 rounded-sm text-sm"
            >
              Get a Quote
            </button>
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
          <div className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left text-white/80 hover:text-[#E8A020] font-medium py-2 border-b border-white/10 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-amber px-5 py-3 rounded-sm text-sm mt-2"
            >
              Get a Free Quote
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
