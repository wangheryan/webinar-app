// src/components/marketing/circular-speakers.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Globe, Award, Link2, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SpeakerDetail {
  id: string;
  name: string;
  designation: string;
  bio: string;
  src: string;
  company?: string | null;
  credentials: string[];
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
}

interface CircularSpeakersProps {
  speakers: SpeakerDetail[];
}

export function CircularSpeakers({ speakers }: CircularSpeakersProps) {
  // Indeks default yang terbuka informasinya di panel samping
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 🌟 STRATEGI GEOMETRI: Kalkulasi rotasi derajat menyerupai bentukan Kipas Tangan
  function getFanCardStyle(index: number): React.CSSProperties {
    const isActive = index === activeIndex;
    const isHovered = index === hoveredIndex;

    // Hitung jarak indeks relatif dari elemen yang sedang aktif
    const offset = index - activeIndex;

    // Parameter sudut kipas (12 derajat per rentang kartu)
    const rotateAngle = offset * 12;

    // Pergeseran horizontal melingkar agar tumpukan bawah menyatu, atas melebar
    const translateX = offset * 32;
    // Pergeseran vertikal melengkung ke bawah (efek busur lingkaran)
    const translateY = Math.abs(offset) * 8;

    if (isActive) {
      return {
        zIndex: 40,
        opacity: 1,
        transform: `translateX(0px) translateY(-16px) scale(1.05) rotate(0deg)`,
        transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
      };
    }

    if (isHovered) {
      return {
        zIndex: 35,
        opacity: 0.95,
        transform: `translateX(${translateX}px) translateY(${translateY - 12}px) scale(0.98) rotate(${rotateAngle}deg)`,
        transition: "all 0.3s ease-out",
      };
    }

    // Kondisi default saat kartu mengantre di dalam rentang struktur kipas
    return {
      zIndex: 20 - Math.abs(offset),
      opacity: Math.max(0.2, 1 - Math.abs(offset) * 0.25), // Semakin jauh dari tengah semakin pudar lembut
      transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${1 - Math.abs(offset) * 0.05}) rotate(${rotateAngle}deg)`,
      transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
    };
  }

  return (
    <div className="w-full bg-white dark:bg-[#111622]/20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* ── PANEL KIRI: DECK KIPAS TANGAN INTERAKTIF (lg:col-span-6) ── */}
        <div className="lg:col-span-6 relative w-full h-[260px] sm:h-[320px] flex items-end justify-center overflow-visible pb-6 bg-slate-50/50 dark:bg-[#0c1017]/20 rounded-xl border border-slate-100 dark:border-slate-900/60 p-4">
          <div className="relative w-full max-w-[200px] h-[220px] sm:h-[260px] flex items-center justify-center">
            {speakers.map((speaker, index) => (
              <div
                key={speaker.id}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`absolute w-[130px] sm:w-[150px] aspect-[3/4] rounded-xl overflow-hidden shadow-md border bg-white dark:bg-zinc-900 cursor-pointer select-none origin-bottom transition-all ${index === activeIndex
                  ? "border-blue-500 shadow-blue-500/10 dark:border-[#00d1ff] dark:shadow-none"
                  : "border-slate-200/80 dark:border-slate-800/80"
                  }`}
                style={getFanCardStyle(index)}
              >
                <img
                  src={speaker.src}
                  alt={speaker.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex items-end p-2.5">
                  <p className="text-[9.5px] font-semibold text-white tracking-tight truncate w-full">{speaker.name.split(" ")[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PANEL KANAN: LIVE DETAIL DISPLAY WINDOW (lg:col-span-6) ── */}
        <div className="lg:col-span-6 h-full min-h-[260px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="space-y-4"
            >
              {/* Kepala Judul Profil */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[8.5px] font-bold tracking-widest text-blue-600 dark:text-[#00d1ff] bg-blue-500/5 dark:bg-[#00d1ff]/10 border border-blue-500/10 px-2 py-0.5 rounded uppercase block w-fit">
                    {speakers[activeIndex]?.company || "Independent Advisor"}
                  </span>
                  <div className="flex items-center gap-1 text-[8.5px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                    <ShieldCheck size={10} /> Verified
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {speakers[activeIndex]?.name}
                </h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {speakers[activeIndex]?.designation}
                </p>
              </div>

              {/* Isi Manifes Biografi */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {speakers[activeIndex]?.bio}
                </p>
              </div>

              {/* Kredensial Lencana */}
              <div className="space-y-1.5">
                <span className="text-[8.5px] font-bold uppercase text-slate-400 tracking-wider block">Kredensial Ahli</span>
                <div className="flex flex-wrap gap-1.5">
                  {speakers[activeIndex]?.credentials.map((cred, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[9.5px] font-semibold bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 shadow-3xs">
                      <Award size={10} className="text-amber-500 shrink-0" />
                      <span className="truncate">{cred}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* FOOTER MEDIA HUBUNGAN EKSTERNAL */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50 w-full mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              {speakers[activeIndex]?.linkedinUrl && (
                <a href={speakers[activeIndex].linkedinUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-[#00d1ff] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-lg transition-all"><Link2 size={13} /></a>
              )}
              {speakers[activeIndex]?.websiteUrl && (
                <a href={speakers[activeIndex].websiteUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-[#00d1ff] bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-lg transition-all"><Globe size={13} /></a>
              )}
            </div>

            <div className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 uppercase tracking-wider">
              <span>Pilih kartu untuk menukar ahli</span>
              <ArrowRight size={11} className="animate-pulse" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}