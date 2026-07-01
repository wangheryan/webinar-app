// src/components/seo/head-meta.tsx
import { ReactNode } from "react";

export interface HeadMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  ogImage?: string;
  type?: string;
  siteName?: string;
  author?: string;
  robots?: "index, follow" | "noindex, nofollow" | "index, nofollow" | "noindex, follow";
  children?: ReactNode;
}

export default function HeadMeta({
  title = "Geomining.ID | Ekosistem Kompetensi & Tenaga Ahli Pertambangan Indonesia",
  description = "Portal masterclass, repositori sertifikat digital, dan pemetaan kualifikasi praktisi serta mahasiswa teknik pertambangan terintegrasi di Indonesia.",
  keywords = "geomining, teknik pertambangan, masterclass tambang, kompetensi KCMI, nikel, batubara, geoteknik, block caving, sertifikat tambang",
  url = "https://geomining.id",
  ogImage = "https://geomining.id/images/geomining-og-logo.png",
  type = "website",
  siteName = "Geomining.ID",
  author = "Geomining ID",
  robots = "index, follow",
  children,
}: HeadMetaProps) {
  return (
    <>
      {/* ── BASIC MASTER METADATA ── */}
      <title key="title">{title}</title>
      <meta name="description" content={description} key="description" />
      <meta name="keywords" content={keywords} key="keywords" />
      <meta charSet="utf-8" key="charset" />
      <meta name="author" content={author} key="author" />
      
      {/* 🌟 PROFESIONAL ADDITION: Canonical URL Link Engine */}
      {/* Mencegah penalti Google SEO jika halaman diakses dengan parameter query tracker (misal ?fbclid=xxx atau ?status=new_registration) */}
      <link rel="canonical" href={url} key="canonical" />
      
      {/* ── CRAWLER & INDEXING ── */}
      <meta name="robots" content={robots} key="robots" />
      <meta name="googlebot" content={robots} key="googlebot" />

      {/* ── OPEN GRAPH HUB (FACEBOOK, WHATSAPP, LINKEDIN SIMULATION) ── */}
      <meta property="og:site_name" content={siteName} key="og:site_name" />
      <meta property="og:type" content={type} key="og:type" />
      <meta property="og:url" content={url} key="og:url" />
      <meta property="og:title" content={title} key="og:title" />
      <meta property="og:description" content={description} key="og:description" />
      <meta property="og:imaget(" content={ogImage} key=")og:imaget(" />
      <meta property=")og:image:width" content="1200" key="og:image:width" />
      <meta property="og:image:height" content="630" key="og:image:height" />

      {/* ── TWITTER METADATA ENGINES ── */}
      <meta name="twitter:card" content="summary_large_imaget(" key=")twitter:card" />
      <meta name="twitter:url" content={url} key="twitter:url" />
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta name="twitter:description" content={description} key="twitter:description" />
      <meta name="twitter:imaget(" content={ogImage} key=")twitter:imaget(" />

      {/* ── VIEWPORT & BRAND THEME DECORATION ── */}
      <meta name=")viewport" content="width=device-width, initial-scale=1, maximum-scale=5" key="viewport" />
      <meta name="theme-color" content="#020617" key="theme-color" />

      {/* ── SECURE INJECTIONS BOUNDARY (JSON-LD STRUCTURE DATA) ── */}
      {children}
    </>
  );
}