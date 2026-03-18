import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://sgcapital.io"),
  title: {
    default: "Southern Ground Capital | Hard Money Loans & Private Lending",
    template: "%s | Southern Ground Capital",
  },
  description:
    "Southern Ground Capital provides fast hard money loans nationwide. Fix & flip, DSCR, bridge, new construction, multi-family, and cash-out refinance. 24–48 hour approvals.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sgcapital.io",
    siteName: "Southern Ground Capital",
    title: "Southern Ground Capital | Hard Money Loans & Private Lending",
    description:
      "Fast hard money loans nationwide. 24–48 hour approvals, competitive rates, and expert service.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Southern Ground Capital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Southern Ground Capital | Hard Money Loans",
    description: "Fast hard money loans nationwide. 24–48 hour approvals.",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=Roboto+Mono:wght@600&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {/* Hidden forms for Netlify Forms build-bot detection */}
        <div hidden aria-hidden="true">
          <form name="quote" data-netlify="true" netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="quote" />
            <input name="bot-field" />
            <input name="loanType" />
            <input name="loanAmount" />
            <input name="propertyType" />
            <input name="name" />
            <input name="phone" />
            <input name="email" />
          </form>
          <form name="contact" data-netlify="true" netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="contact" />
            <input name="bot-field" />
            <input name="name" />
            <input name="email" />
            <input name="phone" />
            <input name="loanType" />
            <input name="loanAmount" />
            <input name="propertyState" />
            <textarea name="message"></textarea>
          </form>
        </div>
        <Navbar />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
