// src/app/(public)/webinars/[slug]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import HeadMeta from "@/components/seo/head-meta";
import {
  Clock, Users, ShieldCheck,
  Presentation,
  Layers, BadgeCheck, Loader2,
  CheckCircle2, ShoppingCart, Building2,
  CalendarDays, VideoIcon,
  QrCode, Info, ChevronDown,
  LucideIcon
} from "lucide-react";


interface WebinarDetailPageProps {
  params: Promise<{ slug: string }>;
}

interface SpeakerData {
  name: string;
  title: string;
  company: string | null;
  image: string;
}

interface WebinarAddonData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
}

interface WebinarSessionData {
  id: string;
  title: string;
  startDate: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface WebinarData {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  abstract: string;
  category: string;
  imageUrl: string;
  basePrice: number;
  accessType: string;
  duration: string;
  isLive: boolean;
  slug: string;
  faqs: FaqItem[] | unknown;
  speakers: SpeakerData[];
  addons?: WebinarAddonData[];
  sessions?: WebinarSessionData[];
  _count: { enrollments: number };
}

// Komponen Tab Item
const TabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: LucideIcon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${active
      ? "border-primary text-primary bg-primary/5"
      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

export default function WebinarDetailPage({ params }: WebinarDetailPageProps) {
  const { slug } = use(params);


  // ── 🌟 NEXT-AUTH SESSION PROVIDER ──
  const { status } = useSession();

  // ── 🧠 CORE STATE ENGINE ──
  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // TABS STATE
  const [activeTab, setActiveTab] = useState<"ringkasan" | "jadwal" | "narasumber">("ringkasan");

  useEffect(() => {
    async function initializePage() {
      try {
        const webinarRes = await fetch(`/api/webinars/${slug}`);
        if (!webinarRes.ok) {
          setErrorStatus(webinarRes.status);
          return;
        }
        const webinarData = await webinarRes.json();
        setWebinar(webinarData);
      } catch (err) {
        console.error("🚨 INITIALIZATION_FATAL_ERROR:", err);
        setErrorStatus(500);
      } finally {
        setLoading(false);
      }
    }
    initializePage();
  }, [slug]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>{"Sesi Sinkron"}</span>
      </div>
    );
  }

  if (errorStatus === 404 || !webinar) {
    notFound();
  }

  // ── 🛠️ UTILITIES & CALCULATION LOGIC ──
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const formatSessionDate = (isoString: string) => {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(new Date(isoString));
  };

  const faqList = Array.isArray(webinar.faqs) ? (webinar.faqs as FaqItem[]) : [];
  const sessionsList = webinar.sessions || [];

  return (
    <>
      <HeadMeta
        title={`${webinar.title} | Webinar Geomining.ID`}
        description={webinar.subtitle || `Tingkatkan kapabilitas tim korporasi Anda melalui program corporate training ${webinar.title} resmi di Geomining.ID.`}
        keywords="corporate training, masterclass executive, sertifikasi korporat, manajemen pertambangan"
        ogImage={webinar.imageUrl || undefined}
        url={`https://geomining.id/webinars/${slug}`}
        type="article"
      />

      <main className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-foreground pb-24 sm:pb-8 pt-0 sm:pt-8 px-0 sm:px-6 lg:px-8 antialiased selection:bg-primary/10">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pt-16 lg:pt-20">

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">

            {/* PANEL KIRI (ARTIKEL EDITORIAL) */}
            <article className="xl:col-span-8 bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl shadow-3xs overflow-hidden">

              {/* HERO BANNER SECTION (Compact) */}
              <div className="w-full aspect-[21/9] sm:aspect-[24/9] bg-muted/30 relative overflow-hidden group">
                {webinar.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={webinar.imageUrl} alt={webinar.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-mono font-semibold text-xs">CORPORATE ASSET PLACEHOLDER</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

                {/* Title overlay inside banner */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-lg">
                      <Presentation size={12} /> {webinar.category}
                    </span>
                    {webinar.isLive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 backdrop-blur-sm text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-lg">
                        <VideoIcon size={12} /> {"Siaran Langsung"}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight uppercase font-sans drop-shadow-md">
                    {webinar.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-foreground/80 font-medium leading-relaxed max-w-3xl drop-shadow-sm line-clamp-2">
                    {webinar.subtitle}
                  </p>
                </div>
              </div>

              {/* TABS NAVIGATION (Sticky) */}
              <div className="flex overflow-x-auto no-scrollbar border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-14 sm:top-[72px] z-20 shadow-2xs">
                <TabButton active={activeTab === "ringkasan"} onClick={() => setActiveTab("ringkasan")} label={"Ringkasan"} icon={Info} />
                {sessionsList.length > 0 && <TabButton active={activeTab === "jadwal"} onClick={() => setActiveTab("jadwal")} label={"Jadwal & Silabus"} icon={CalendarDays} />}
                {webinar.speakers && webinar.speakers.length > 0 && <TabButton active={activeTab === "narasumber"} onClick={() => setActiveTab("narasumber")} label="Narasumber" icon={BadgeCheck} />}
              </div>

              {/* TAB CONTENTS */}
              <div className="p-4 min-h-[300px]">

                {/* CONTENT: RINGKASAN */}
                {activeTab === "ringkasan" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {webinar.abstract ? (
                      <div className="space-y-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/30 pb-1.5"><Layers size={14} className="text-primary" /> {"Ringkasan Eksekutif"}</h2>
                        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/5 p-4 rounded-xl border border-border/30">{webinar.abstract}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">{"Deskripsi belum tersedia untuk program ini."}</p>
                    )}

                    {/* Quick Metadata Snippet */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/5 p-3 rounded-xl border border-border/40 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Clock size={16} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{"Durasi Pembelajaran"}</p>
                          <p className="text-xs font-bold text-foreground truncate">{webinar.duration}</p>
                        </div>
                      </div>
                      <div className="bg-muted/5 p-3 rounded-xl border border-border/40 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Users size={16} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{"Kapasitas Peserta"}</p>
                          <p className="text-xs font-bold text-foreground truncate">{webinar._count?.enrollments || 0} {"Profesional"}</p>
                        </div>
                      </div>
                      <div className="bg-muted/5 p-3 rounded-xl border border-border/40 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{"Sertifikat Elektronik"}</p>
                          <p className="text-xs font-bold text-emerald-500 truncate">{"Terverifikasi Resmi"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* CONTENT: JADWAL */}
                {activeTab === "jadwal" && sessionsList.length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/30 pb-1.5"><CalendarDays size={14} className="text-primary" /> {"Rangkaian Kegiatan"}</h2>
                    <div className="relative pl-4 border-l border-border/60 space-y-4 ml-2">
                      {sessionsList.map((session, sIdx) => (
                        <div key={session.id} className="relative group bg-muted/5 border border-border/30 rounded-xl p-3.5 hover:border-primary/30 transition-colors">
                          {/* Timeline Dot */}
                          <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-xs group-hover:scale-125 transition-transform" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider block bg-primary/10 w-fit px-1.5 py-0.5 rounded">{"Sesi"} 0{sIdx + 1}</span>
                              <h4 className="text-xs font-semibold text-foreground leading-tight">{session.title}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-background px-2.5 py-1.5 rounded-md border border-border/40 w-fit shrink-0">
                              <Clock size={12} className="text-primary" /> {formatSessionDate(session.startDate)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTENT: NARASUMBER */}
                {activeTab === "narasumber" && webinar.speakers && webinar.speakers.length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/30 pb-1.5"><BadgeCheck size={14} className="text-primary" /> Narasumber</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[3px] pt-1">
                      {webinar.speakers.map((s, index) => (
                        <div key={index} className="flex items-center gap-3 bg-muted/5 p-[3px] rounded-xl border border-border/30 hover:bg-muted/10 transition-colors">
                          <div className="h-10 w-10 bg-muted/80 border border-border/50 rounded-full shrink-0 overflow-hidden shadow-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-xs truncate leading-tight">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-medium leading-none">{s.title}</p>
                            {s.company && <p className="text-[9px] font-mono text-primary font-semibold tracking-wider uppercase truncate flex items-center gap-1 pt-0.5"><Building2 size={10} />{s.company}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTENT: FAQ (DI LUAR TAB) */}
                {faqList.length > 0 && (
                  <div className="border-t border-border/30 pt-6 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2 pb-1.5"><Layers size={14} className="text-primary" /> {"Pertanyaan Sering Diajukan"}</h2>
                    <div className="space-y-2">
                      {faqList.map((f, index) => (
                        <details key={index} className="group border border-border/40 rounded-xl bg-muted/5 [&_summary::-webkit-details-marker]:hidden transition-all duration-300 open:bg-card">
                          <summary className="flex items-center justify-between gap-1.5 p-3 text-xs font-semibold text-foreground cursor-pointer select-none">
                            <div className="flex items-start gap-2">
                              <span className="text-primary font-mono font-black">Q:</span>
                              <span className="leading-tight">{f.question}</span>
                            </div>
                            <span className="transition duration-300 group-open:-rotate-180 shrink-0">
                              <ChevronDown size={14} className="text-muted-foreground" />
                            </span>
                          </summary>
                          <div className="px-3 pb-3 pt-0 pl-7 text-[11px] text-muted-foreground leading-relaxed border-l border-primary/20 ml-2">
                            {f.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* SISI KANAN (CLEAN PURCHASE ACCESS CARD - DESKTOP ONLY) */}
            <div className="hidden sm:block xl:col-span-4 space-y-4 w-full sticky top-24">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm w-full relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <QrCode size={120} />
                </div>

                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">{"Investasi Pendidikan"}</span>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-bold text-foreground tracking-tighter">
                      {webinar.basePrice === 0 ? "free" : formatCurrency(webinar.basePrice)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-5 relative z-10">
                  <p className="text-[10px] font-semibold text-foreground uppercase tracking-widest">{"Akses Standar Termasuk:"}</p>
                  <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {"Akses Langsung Webinar"}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {"Sesi Tanya Jawab Interaktif"}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {"Unduh Materi (PDF)"}
                    </li>
                  </ul>
                </div>

                {/* Tombol Eksekusi Alih ke Checkout */}
                <Link
                  href={`/checkout?webinar=${webinar.slug}`}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10 group"
                >
                  <ShoppingCart size={16} className="group-hover:scale-110 transition-transform" />
                  <span>{"Daftar Webinar Sekarang"}</span>
                </Link>
                <p className="text-[10px] text-center text-muted-foreground mt-2 relative z-10">{"Transaksi Aman & Terenkripsi"}</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FIXED BOTTOM BAR UNTUK MOBILE */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-full duration-500">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{"Biaya Pendaftaran"}</span>
          <span className="text-lg font-bold text-foreground tracking-tighter truncate">
            {webinar.basePrice === 0 ? "free" : formatCurrency(webinar.basePrice)}
          </span>
        </div>
        <Link
          href={`/checkout?webinar=${webinar.slug}`}
          className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <ShoppingCart size={14} />
          <span>{"Daftar"}</span>
        </Link>
      </div>
    </>
  );
}