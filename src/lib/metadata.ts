// src/lib/metadata.ts
import { Metadata, Viewport } from "next";

export interface HeadMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  ogImage?: string;
  type?: "website" | "profile" | "article";
  siteName?: string;
  author?: string;
  robots?: "index, follow" | "noindex, nofollow" | "index, nofollow" | "noindex, follow";
  // Untuk Google Graph (Knowledge Graph)
  graphType?: "Organization" | "Person";
  sameAs?: string[];
  // 🌟 BARU: Mengontrol apakah judul database otomatis ditempelkan suffix nama brand
  appendSuffix?: boolean; 
}

export function constructSEOConfig({
  title = "Geocore Portal",
  description = "Platform digital terpadu untuk penjenjangan karir, manajemen portofolio kompetensi, dan pengesahan lisensi resmi KCMI/CPI bagi praktisi pertambangan Indonesia.",
  keywords = "geoteknik, pertambangan, cpi tambang, kcmi, software pertambangan, ijazah geologi, slope stability",
  url = "https://geomining.id",
  ogImage = "/images/assets/screen.png",
  type = "website",
  siteName = "Geocore",
  author = "Geocore Team",
  robots = "index, follow",
  graphType = "Organization",
  sameAs = [],
  appendSuffix = true, // Default aktif untuk menghemat penulisan kode di page
}: HeadMetaProps = {}) {
  
  // 🌟 EFFICIENCY ENGINE: Jika judul berasal dari database dan membutuhkan brand suffix
  const defaultSuffix = "— Geocore";
  const finalTitle = appendSuffix && !title.includes(defaultSuffix)
    ? `${title} ${defaultSuffix}`
    : title;

  // 1. Next.js App Router Strict Metadata Object
  const metadata: Metadata = {
    title: finalTitle,
    description,
    keywords,
    authors: [{ name: author }],
    robots: {
      index: robots.includes("index"),
      follow: robots.includes("follow"),
      googleBot: {
        index: robots.includes("index"),
        follow: robots.includes("follow"),
      },
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      siteName,
      type,
      url,
      title: finalTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    }
  };

  // 2. Next.js App Router Strict Viewport Object
  const viewport: Viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };

  // 3. Google Knowledge Graph Structured Data Schema (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": graphType,
    name: siteName,
    url: url,
    description: description,
    ...(graphType === "Organization" 
      ? { logo: ogImage } 
      : { image: ogImage }
    ),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return {
    metadata,
    viewport,
    jsonLd,
  };
}