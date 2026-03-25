import { SpanishSection } from "@/components/SpanishSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Préstamos para Inversionistas | SG Capital en Español",
  description:
    "Financiamiento privado para inversionistas de bienes raíces. Fix & Flip, rentales y construcción nueva. Sin verificación de ingresos. Aprobación en 24–48 horas.",
  alternates: {
    canonical: "https://sgcapital.io/espanol",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: "https://sgcapital.io" },
    { "@type": "ListItem", position: 2, name: "Español", item: "https://sgcapital.io/espanol" },
  ],
};

export default function EspanolPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Page Hero */}
        <section className="relative pt-32 pb-16 bg-[#0A1628] overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="relative z-10 container text-center">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-[#E8A020]" />
              <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
                SG Capital · En Español
              </span>
              <div className="h-px w-10 bg-[#E8A020]" />
            </div>
            <h1 className="font-display text-white text-5xl md:text-6xl leading-tight mb-4">
              FINANCIAMIENTO RÁPIDO<br />
              <span className="text-[#E8A020]">PARA INVERSIONISTAS</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Prestamista directo. Sin banco. Sin demoras.
            </p>
          </div>
        </section>

        <SpanishSection />
      </main>
    </>
  );
}
