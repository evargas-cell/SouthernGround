import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sgcapital.io";
  const lastModified = new Date().toISOString();

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/fix-and-flip-loans`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/dscr-loans`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/bridge-loans`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/new-construction-loans`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/multi-family-loans`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/cash-out-refinance`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/testimonials`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/broker-program`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/calculator`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/rates-and-terms`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
