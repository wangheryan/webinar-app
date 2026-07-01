// src/app/(public)/speaker/_components/speaker-grid.tsx
"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Globe, ShieldCheck, ArrowUpRight, CheckCircle2, Link2Icon } from "lucide-react";


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

interface SpeakerGridProps {
  speakers: SpeakerDetail[];
}

export function SpeakerGrid({ speakers }: SpeakerGridProps) {
  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Helper text for scrolling */}
      <div className="flex items-center justify-end mb-4 pr-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="animate-pulse">←</span> Geser <span className="hidden sm:inline">untuk melihat</span> <span className="animate-pulse">→</span>
        </span>
      </div>

      {/* Carousel Container */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 pb-12 pt-4 px-4 sm:px-8 -mx-4 sm:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)]">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="group relative flex flex-col w-[85vw] sm:w-[380px] shrink-0 snap-center bg-white dark:bg-[#111622] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
          >
            {/* Portrait Section (Compact overlay style) */}
            <div className="relative w-full aspect-[4/3] shrink-0 bg-slate-100 dark:bg-[#0a0d14] overflow-hidden border-b border-slate-100 dark:border-slate-800/60">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent z-10" />
              <img
                src={speaker.src || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"}
                alt={speaker.name || "Speaker"}
                className="absolute inset-0 w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                loading="lazy"
              />
              {/* Top Tag */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-[9px] font-bold text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/10 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Narasumber Ahli
              </div>

              {/* Overlay Name & Title */}
              <div className="absolute bottom-4 left-5 right-5 z-20">
                <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                  {speaker.name}
                </h3>
                <p className="text-[13px] font-semibold text-amber-400 drop-shadow-sm mt-0.5 line-clamp-1">
                  {speaker.designation}
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col p-6 space-y-5">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded border border-slate-200/50 dark:border-slate-700/50 truncate max-w-[60%]">
                  {speaker.company || "Konsultan Independen"}
                </span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest whitespace-nowrap">
                  <ShieldCheck size={12} /> Terverifikasi
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-4">
                {speaker.bio}
              </p>

              {/* Credentials */}
              {speaker.credentials.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {speaker.credentials.slice(0, 3).map((cred, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-800/60 shadow-3xs max-w-full">
                      <CheckCircle2 size={12} className="text-amber-500 shrink-0" />
                      <span className="truncate">{cred}</span>
                    </div>
                  ))}
                  {speaker.credentials.length > 3 && (
                    <div className="flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/30 px-2 rounded-md border border-slate-200/40 dark:border-slate-800/40">
                      +{speaker.credentials.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Hubungi Profil
                </div>
                <div className="flex items-center gap-2">
                  {speaker.websiteUrl && (
                    <a href={speaker.websiteUrl} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700" aria-label="Website">
                      <Globe size={14} />
                    </a>
                  )}
                  {speaker.linkedinUrl && (
                    <a href={speaker.linkedinUrl} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-[#0A66C2] hover:bg-blue-50 dark:hover:text-[#3888ff] dark:hover:bg-blue-900/20 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30" aria-label="LinkedIn">
                      <Link2Icon size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
