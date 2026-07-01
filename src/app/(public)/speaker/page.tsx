/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/speakers/page.tsx
import { getSpeakersPool } from "@/actions/speaker";
import { SpeakerGrid } from "./_components/speaker-grid";
import { AlertCircle, Terminal } from "lucide-react";


export const revalidate = 0; // Memaksa halaman melakukan pengecekan data paling segar di DB (Dynamic Rendering)

export default async function SpeakersPage() {
  // Menembak data pool secara asinkron sebelum struktur HTML dikirim ke browser
  const result = await getSpeakersPool();


  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-12">

        {/* ELEGANT BRAND HEADER SECTION */}
        <div className="flex flex-col space-y-5 max-w-3xl items-center text-center mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.25em] uppercase w-fit shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Executive Network
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Pakar & Eksekutif Industri
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
            Belajar langsung dari para pemimpin yang telah membuktikan diri di medan nyata. Jelajahi wawasan, rekam jejak, dan pengalaman eksklusif dari jajaran narasumber kami.
          </p>
        </div>

        {/* CONTAINER DISPATCHER MULTI CARD STACKING */}
        <main className="w-full">
          {!result.success || !result.data || result.data.length === 0 ? (
            /* EMPTY STATE: Fallback jika tabel Speaker kosong di PostgreSQL */
            <div className="w-full border border-dashed border-slate-300 dark:border-slate-800/80 rounded-xl p-16 text-center flex flex-col items-center justify-center space-y-4 bg-white dark:bg-[#111622]/40 shadow-xs">
              <div className="p-4 bg-amber-500/10 rounded-full">
                <AlertCircle className="text-amber-600 dark:text-amber-500" size={32} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 font-mono tracking-tight">
                {result.error || "Belum ada narasumber yang terdaftar saat ini."}
              </p>
            </div>
          ) : (
            /* RENDER COMPONENT LAYOUT JIKA DATA DITEMUKAN */
            <SpeakerGrid speakers={result.data.map((s: any) => ({
              id: s.id,
              name: s.name,
              designation: s.title,
              src: s.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
              company: s.company || "",
              bio: s.bio || "",
              credentials: s.credentials || [],
              linkedinUrl: s.linkedinUrl,
              websiteUrl: s.websiteUrl
            }))} />
          )}
        </main>

      </div>
    </div>
  );
}