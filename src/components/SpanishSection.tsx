'use client';

/*
 * SpanishSection — Southern Ground Capital
 * Spanish-language overview of products + contact form
 */

import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, Home, Building2, TrendingUp, Layers, Banknote } from "lucide-react";

const products = [
  {
    icon: TrendingUp,
    name: "Fix & Flip",
    tag: "Compra y Remodelación",
    highlights: [
      "Hasta 90% del precio de compra",
      "Hasta 75% del valor después de reparación",
      "Plazo: 12 meses (18 disponible)",
      "Monto: $50K – $3M",
      "Desde 8.25%*",
    ],
  },
  {
    icon: Building2,
    name: "Construcción Nueva",
    tag: "Ground Up",
    highlights: [
      "Hasta 85% del costo total",
      "Hasta 70% del valor proyectado",
      "Plazo: 12–24 meses",
      "Monto: $50K – $3M",
      "Desde 8.99%*",
    ],
  },
  {
    icon: Layers,
    name: "Puente Estabilizado",
    tag: "Stabilized Bridge",
    highlights: [
      "Hasta 70% LTV",
      "85% de compra + CapEx",
      "Plazo: 12 meses (hasta 18)",
      "Monto: $50K – $3M",
      "Desde 8.25%*",
    ],
  },
  {
    icon: Home,
    name: "Préstamo de Renta Individual",
    tag: "Single Property Rental",
    highlights: [
      "Hasta 80% LTV (compra/refi)",
      "75% retiro de capital",
      "DSCR mínimo: 1.05x",
      "Plazo: 30 años",
      "Desde 5.39%*",
    ],
  },
  {
    icon: Banknote,
    name: "Portafolio de Rentales",
    tag: "Rental Portfolio",
    highlights: [
      "Múltiples propiedades",
      "Mínimo $100K — Máximo $2M",
      "DSCR 1.05x (≤$2M / ≤10 prop.)",
      "Plazo: 30 años",
      "Desde 5.39%*",
    ],
  },
];

const loanTypesEs = [
  "Fix & Flip (Compra y Remodelación)",
  "Construcción Nueva",
  "Puente Estabilizado",
  "Préstamo de Renta Individual",
  "Portafolio de Rentales",
  "Otro",
];

export function SpanishSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    loanType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const body = new URLSearchParams({
        "form-name": "contacto-espanol",
        formType: "contacto-espanol",
        ...formData,
      });
      const res = await fetch("/netlify-forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Algo salió mal. Por favor inténtelo de nuevo o llámenos directamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="espanol" className="py-24 bg-[#060E1C]">
      <div className="container">

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
              Sección en Español
            </span>
            <div className="h-px w-10 bg-[#E8A020]" />
          </div>
          <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mb-4">
            ¿HABLAS ESPAÑOL?<br />
            <span className="text-[#E8A020]">ESTAMOS AQUÍ PARA AYUDARTE.</span>
          </h2>
          <p className="text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            En SG Capital ofrecemos financiamiento privado para inversionistas de bienes raíces.
            Sin verificación de ingresos. Sin papeleo excesivo. Aprobación en 24–48 horas.
          </p>
        </div>

        {/* Why Us — bullets */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Sin tarifas por adelantado", sub: "No upfront fees" },
            { label: "Aprobación en 24–48 hrs", sub: "Fast approval" },
            { label: "Prestamista directo", sub: "Direct lender" },
            { label: "Sin verificación de ingresos", sub: "No W2 / tax returns (rentales)" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 bg-[#0A1628] border border-[#E8A020]/15 rounded-sm p-4"
            >
              <CheckCircle2 size={16} className="text-[#E8A020] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-white text-sm font-medium">{item.label}</div>
                <div className="text-white/35 text-xs mt-0.5">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mb-16">
          <h3 className="font-display text-white text-2xl mb-6 text-center">
            NUESTROS PRODUCTOS
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className="bg-[#0A1628] border border-[#E8A020]/15 rounded-sm p-6 hover:border-[#E8A020]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-sm bg-[#E8A020]/10 border border-[#E8A020]/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[#E8A020]" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm leading-tight">{p.name}</div>
                      <div className="text-white/35 text-xs">{p.tag}</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-white/65 text-sm">
                        <span className="text-[#E8A020] mt-0.5 flex-shrink-0">›</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="text-white/30 text-xs text-center mt-4">
            *Las tasas anunciadas son las más bajas ofrecidas. Las tasas reales pueden variar según el historial crediticio, experiencia y otros criterios de aprobación.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0A1628] border border-[#E8A020]/20 rounded-sm p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#E8A020]/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-[#E8A020]" />
                </div>
                <h3 className="font-display text-white text-3xl">¡MENSAJE RECIBIDO!</h3>
                <p className="text-white/60 text-sm max-w-sm mx-auto">
                  Gracias por comunicarse con nosotros. Un especialista de SG Capital le contactará dentro de 24 horas para hablar sobre su solicitud.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline-amber px-6 py-2.5 rounded-sm text-sm mt-4"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <form
                name="contacto-espanol"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <input type="hidden" name="form-name" value="contacto-espanol" />
                <input type="hidden" name="bot-field" />

                <div className="sgc-amber-bar mb-6">
                  <h3 className="font-display text-white text-xl">ENVÍE SU SOLICITUD</h3>
                  <p className="text-white/40 text-xs mt-1">Un especialista le contactará en 24 horas</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Juan García"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors"
                  />
                </div>

                {/* Phone + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="usted@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Loan Type */}
                <div>
                  <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                    Tipo de Préstamo
                  </label>
                  <div className="relative">
                    <select
                      name="loanType"
                      required
                      value={formData.loanType}
                      onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                      className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 appearance-none focus:border-[#E8A020] focus:outline-none transition-colors"
                    >
                      <option value="" disabled>Seleccione el tipo...</option>
                      {loanTypesEs.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8A020] pointer-events-none" />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-white/50 text-xs font-mono tracking-wider mb-1.5 uppercase">
                    Cuéntenos sobre su proyecto <span className="text-white/30">(Opcional)</span>
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Dirección de la propiedad, precio de compra, presupuesto de remodelación, plazo deseado..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#162B52] border border-[#E8A020]/20 text-white text-sm rounded-sm px-3 py-2.5 placeholder-white/20 focus:border-[#E8A020] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-amber w-full py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Enviando…" : "Enviar Solicitud"}
                  {!isLoading && <ArrowRight size={16} />}
                </button>

                <p className="text-white/25 text-[10px] text-center">
                  Su información es segura y nunca será vendida ni compartida con terceros.
                </p>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
