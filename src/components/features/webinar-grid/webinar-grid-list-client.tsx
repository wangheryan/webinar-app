"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Layers,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  LayoutGrid,
  Wallet,
  PlayCircle
} from "lucide-react";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface WebinarSession {
  startDate: string;
}

interface WebinarAddon {
  id: string;
}

interface Webinar {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string | null;
  duration: string;
  category: string;
  basePrice: number;
  accessType: string;
  imageUrl: string;
  abstract: string;
  isLive: boolean;
  isCompleted: boolean;
  faqs: unknown;
  createdAt: string;
  updatedAt: string;
  sessions: WebinarSession[];
  addons: WebinarAddon[];
}

interface WebinarGridListClientProps {
  initialWebinars: Webinar[];
  categoriesList: string[];
  initialCategory: string;
  initialType: string;
}

export default function WebinarGridListClient({
  initialWebinars,
  categoriesList,
  initialCategory,
  initialType
}: WebinarGridListClientProps) {



  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeType, setActiveType] = useState(initialType);

  const filteredWebinars = useMemo(() => {
    return initialWebinars.filter((webinar) => {
      const matchCategory = activeCategory === "ALL" || webinar.category === activeCategory;
      const matchType = activeType === "ALL" || webinar.accessType === activeType;
      return matchCategory && matchType;
    });
  }, [activeCategory, activeType, initialWebinars]);

  // Sync state with filters and update URL without reload
  useEffect(() => {
    // Update URL query parameters client-side without page reload or component unmounting
    const params = new URLSearchParams(window.location.search);
    if (activeCategory !== "ALL") {
      params.set("category", activeCategory);
    } else {
      params.delete("category");
    }

    if (activeType !== "ALL") {
      params.set("type", activeType);
    } else {
      params.delete("type");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.pushState(null, "", newUrl);
  }, [activeCategory, activeType]);

  const accessFilters = [
    { id: "ALL", label: "Semua Akses", icon: LayoutGrid },
    { id: "FREE", label: "Gratis", icon: Sparkles },
    { id: "PAID", label: "Berbayar", icon: Wallet },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start antialiased text-foreground font-sans">

      {/* ── 📂 SIDEBAR KATEGORI (HORIZONTAL ON MOBILE, VERTICAL ON DESKTOP) ── */}
      <div className="lg:col-span-3 lg:sticky lg:top-20 bg-card/60 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-b lg:border-none border-border/50 py-3 lg:py-0 mb-4 lg:mb-0 -mx-4 sm:mx-0 px-4 sm:px-0 shadow-sm lg:shadow-none z-10 sticky top-14">
        <div className="space-y-4">
          <div className="hidden lg:flex items-center justify-between border-b border-border/40 pb-3">
            <p className="font-extrabold uppercase tracking-widest text-muted-foreground text-[10px] flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <span>{"Topik Webinar"}</span>
            </p>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              {categoriesList.length - 1} {"Kategori"}
            </span>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide snap-x">
            {categoriesList.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 lg:w-full text-center lg:text-left px-4 py-2 lg:py-2.5 text-[11px] font-semibold rounded-xl lg:rounded-2xl transition-all duration-300 relative group flex items-center justify-center lg:justify-between snap-start cursor-pointer ${isActive
                    ? "bg-primary text-primary-foreground shadow-[0_4px_14px_0_rgba(245,158,11,0.3)]"
                    : "bg-muted/30 lg:bg-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/50 lg:border-transparent hover:border-border/80"
                    }`}
                >
                  <span className="truncate max-w-[120px] lg:max-w-full">{cat === "ALL" ? "Semua Topik" : cat}</span>
                  {!isActive && (
                    <ArrowUpRight size={12} className="hidden lg:block opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground group-hover:text-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 🖥️ KANAL KANAN: TOP BAR & WEBINAR GRID ── */}
      <div className="lg:col-span-9 space-y-6">

        {/* COMPACT TOP BAR */}
        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-3 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            <p className="text-[11px] font-medium text-muted-foreground">
              Menampilkan {filteredWebinars.length} webinar
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {accessFilters.map((filter) => {
              const isActive = activeType === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveType(filter.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <filter.icon size={12} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTAINER GRID CARDS WEBINAR */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredWebinars.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center py-24 bg-card/40 border border-border/50 border-dashed rounded-3xl p-6 text-muted-foreground flex flex-col items-center justify-center gap-3"
              >
                <div className="h-12 w-12 bg-muted/50 rounded-xl flex items-center justify-center mb-2 shadow-inner border border-border/40">
                  <PlayCircle size={24} className="text-muted-foreground/60" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Webinar Tidak Ditemukan</h3>
                <p className="text-[11px] max-w-xs text-center font-medium">Pilih kategori atau akses lain.</p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
              >
                {filteredWebinars.map((webinar) => {
                  const hasSessions = webinar.sessions.length > 0;
                  const hasAddons = webinar.addons.length > 0;

                  const formattedDate = hasSessions
                    ? new Date(webinar.sessions[0].startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                    : "Segera Hadir";

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      key={webinar.id}
                      className="group bg-card/70 backdrop-blur-xl text-card-foreground border border-border/50 rounded-2xl overflow-hidden flex flex-col h-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 ease-out"
                    >
                      {/* Media Banner (COMPACT 21:9) */}
                      <div className="relative aspect-[21/9] bg-muted overflow-hidden border-b border-border/40">
                        <Image
                          src={webinar.imageUrl}
                          alt={webinar.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent pointer-events-none" />

                        {webinar.isCompleted ? (
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[8px] font-bold uppercase bg-slate-900/80 backdrop-blur-sm text-slate-100 rounded-md tracking-wider border border-slate-700/50 shadow-sm">
                            Telah Selesai
                          </div>
                        ) : webinar.isLive ? (
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[8px] font-bold uppercase bg-destructive/90 backdrop-blur-sm text-destructive-foreground rounded-md tracking-wider flex items-center gap-1 shadow-sm border border-destructive/50">
                            <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                            Live Webinar
                          </div>
                        ) : null}
                      </div>

                      {/* Metadata & Deskripsi (COMPACT PADDING) */}
                      <div className="p-4 flex flex-col flex-1 justify-between relative">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-semibold tracking-wider uppercase">
                            <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/10">{webinar.category}</span>
                            <span className="text-muted-foreground flex items-center gap-1">
                              {webinar.sessions.length} Sesi
                            </span>
                          </div>

                          <Link
                            href={`/webinars/${webinar.slug}`}
                            className="block text-sm font-bold text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors duration-200"
                          >
                            {webinar.title}
                          </Link>

                          {/* Detail Ringkas: Sebaris Inline */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-muted-foreground pt-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-primary" />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-border/80" />
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} className="text-primary" />
                              <span>{webinar.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Harga & CTA (COMPACT MARGINS) */}
                        <div className="flex items-end justify-between pt-3 border-t border-border/40 mt-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm tracking-tight leading-none">
                              {webinar.basePrice === 0 ? (
                                <span className="text-emerald-500 font-bold flex items-center gap-1">
                                  <Sparkles size={12} /> FREE
                                </span>
                              ) : (
                                `Rp ${webinar.basePrice.toLocaleString("id-ID")}`
                              )}
                            </span>
                            {hasAddons && (
                              <span className="text-[8px] text-muted-foreground font-semibold mt-1 tracking-wider uppercase">
                                + ADD-ON
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/webinars/${webinar.slug}`}
                            className="h-8 px-3.5 bg-primary text-primary-foreground font-semibold text-[10px] uppercase tracking-wider rounded-lg shadow-sm hover:bg-primary/90 flex items-center gap-1.5 transition-all"
                          >
                            <ShieldCheck size={14} />
                            <span>Lihat Detail</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
