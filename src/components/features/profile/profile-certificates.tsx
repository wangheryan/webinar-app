// src/components/layout/profile-certificates.tsx
import { Award, Download, FileCheck, CheckCircle, ShieldCheck } from "lucide-react";
import type { LocalWebinarHistoryItem as WebinarHistoryItem } from "@/types/profile";


interface ProfileCertificatesProps {
  webinarHistory: WebinarHistoryItem[];
}

export function ProfileCertificates({ webinarHistory }: ProfileCertificatesProps) {
  // Hanya ambil event yang valid memiliki sertifikat dan nomor sertifikat
  const certifiedList = webinarHistory.filter((w) => w.hasCertificate && w.certificateNumber);


  return (
    <div className="lg:col-span-3 space-y-2 w-full select-none">

      {/* HEADER UTAMA SEKSYEN */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-2">
        <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Award className="h-3.5 w-3.5 text-primary" /> {"Sertifikasi Kompetensi"}
        </h3>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
          <ShieldCheck size={11} /> {certifiedList.length} {"Dokumen Terenkripsi"}
        </span>
      </div>

      {/* JIKA DATA KOSONG */}
      {certifiedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-border/60 rounded-xl bg-muted/10 text-center space-y-2">
          <Award className="h-6 w-6 text-muted-foreground/40 stroke-[1.5]" />
          <p className="text-[11px] text-muted-foreground">
            {"Belum ada sertifikat yang diterbitkan untuk Anda."}
          </p>
        </div>
      ) : (
        // JIKA ADA DATA SERTIFIKAT
        <div className="space-y-2.5">
          {certifiedList.map((cert) => (
            <div
              key={cert.id}
              className="bg-card hover:bg-gradient-to-br hover:from-card hover:to-primary/5 border border-border rounded-xl p-3 space-y-3 shadow-3xs w-full group/cert hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(2,132,199,0.1)] transition-all duration-500 relative overflow-hidden hover:-translate-y-0.5"
            >
              {/* Efek Garis Glow Dekoratif di Atas Kartu saat Hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover/cert:scale-x-100 transition-transform duration-300 origin-left" />

              {/* BARIS DATA JUDUL DAN MINI PREVIEW ICON */}
              <div className="flex gap-3 items-start">
                {/* File Mock Preview Icon */}
                <div className="p-2 bg-primary/5 text-primary rounded-lg border border-primary/10 shrink-0 group-hover/cert:bg-primary group-hover/cert:text-primary-foreground transition-all duration-200">
                  <FileCheck size={16} className="stroke-[2]" />
                </div>

                <div className="space-y-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                    <CheckCircle size={10} className="fill-emerald-500/10" /> {"Validasi Keaslian Terverifikasi"}
                  </span>
                  <h4 className="text-[12px] font-semibold text-foreground leading-snug font-sans line-clamp-2 group-hover/cert:text-primary transition-colors duration-150">
                    {cert.title}
                  </h4>
                </div>
              </div>

              {/* BLOCK DATA METADATA ID & TOMBOL EKSEKUSI */}
              <div className="space-y-2 pt-1">
                {/* ID Container dengan Font Mono Profesional Tambang */}
                <div className="bg-muted/40 dark:bg-[#090d16]/30 px-2.5 py-1.5 rounded border border-border/50 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider">{"ID Sertifikat:"}</span>
                  <span className="font-mono font-semibold text-primary tracking-wide bg-background px-1.5 py-0.5 rounded border border-border/60 shadow-sm">
                    {cert.certificateNumber}
                  </span>
                </div>

                {/* Download Button Enterprise Style */}
                <button className="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/95 text-[11px] font-semibold rounded-lg tracking-wide transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-3xs active:scale-[0.99] group/btn">
                  <Download size={13} className="group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105 transition-transform" />
                  <span>{"Unduh Dokumen (PDF)"}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}