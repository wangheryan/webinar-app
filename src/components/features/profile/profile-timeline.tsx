// src/app/profile/_components/profile-timeline.tsx
import { Calendar, User2, Zap, CheckCircle2, Hourglass, ShieldCheck, CreditCard, XCircle, Video, PlaySquare, FileText } from "lucide-react";
import type { EnrollmentTimelineItem } from "@/types/profile";


interface ProfileTimelineProps {
  enrollments: EnrollmentTimelineItem[];
  isPublic?: boolean;
}

export function ProfileTimeline({ enrollments, isPublic = false }: ProfileTimelineProps) {



  return (
    <div className="lg:col-span-6 space-y-3 w-full text-xs">
      <div className="bg-card text-card-foreground border border-border/60 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">

        {/* HEADER SECTION PANEL */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground flex items-center gap-2.5">
              <Calendar size={16} className="text-primary" /> Riwayat Pendaftaran
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Berikut adalah riwayat aktivitas Anda dalam mengikuti webinar.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold  text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            LIVE_SYNCED
          </span>
        </div>

        {/* TIMELINE INTERACTIVE CONTAINER */}
        <div className="relative border-l-2 border-border/60 pl-4 ml-2.5 space-y-4 pb-2">
          {enrollments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-medium text-xs">
              {"Belum ada riwayat pendaftaran. Ayo temukan webinar pertama Anda!"}
            </div>
          ) : (
            enrollments.map((enrollment) => {
              const isSettled = enrollment.status === "SUCCESS";
              const isPending = enrollment.status === "PENDING";
              const isFree = enrollment.totalAmount === 0;

              // 🌟 PERBAIKAN 1: Ambil data sesi utama
              const mainSession = enrollment.webinar.sessions[0];
              const dbSessionDate = mainSession?.startDate;

              // Cek URL Akses
              const meetingUrl = mainSession?.meetingUrl;
              const recordingUrl = mainSession?.recordingUrl;
              const materialUrl = enrollment.webinar.materialUrl;

              // Konversi objek SQL DateTime murni menjadi format string lokal
              const firstSessionDateFormatted = dbSessionDate
                ? new Date(dbSessionDate).toLocaleDateString('id-ID', {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
                : "scheduleTba";

              const speakerNames = enrollment.webinar.speakers.map(s => s.name).join(", ") || "tba";

              return (
                <div key={enrollment.id} className="relative group/item transition-all duration-300">

                  {/* RING INDIKATOR TIMELINE */}
                  <div className="absolute -left-[30px] top-1.5 flex items-center justify-center z-10">
                    <span className={`w-4 h-4 rounded-full border-[2.5px] bg-background flex items-center justify-center transition-all duration-300 ${isSettled
                      ? "border-primary shadow-[0_0_12px_rgba(2,132,199,0.3)] group-hover/item:scale-110"
                      : isPending
                        ? "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
                        : "border-destructive shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full relative flex ${isSettled ? "bg-primary" : isPending ? "bg-amber-500" : "bg-destructive"
                        }`}>
                        {isPending && <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />}
                      </span>
                    </span>
                  </div>

                  {/* KARTU BARIS KONTEN */}
                  <div className="bg-muted/10 hover:bg-muted/30 border border-border/50 hover:border-border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-all duration-300 shadow-3xs hover:shadow-lg hover:-translate-y-1">

                    {/* DATA SPESIFIKASI ACARA */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="space-y-1.5">
                        <h4 className="text-[13px] font-semibold  text-foreground leading-snug group-hover/item:text-primary transition-colors pr-2">
                          {enrollment.webinar.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-semibold  inline-flex items-center gap-1.5">
                          <User2 size={12} className="text-primary/70" /> {speakerNames}
                        </p>
                      </div>

                      {/* METADATA TAGS BLOCK */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] text-muted-foreground/90 font-medium pt-0.5">
                        <span className="bg-background border border-border/60 px-2 py-0.5 rounded shadow-3xs flex items-center gap-1.5 text-foreground">
                          <Calendar size={11} className="text-primary" /> {firstSessionDateFormatted}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-semibold  text-foreground">
                          <Zap size={11} className="text-amber-500" /> {enrollment.webinar.duration}
                        </span>
                        <span>•</span>
                        <span className="text-primary font-semibold tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/10">
                          {enrollment.webinar.category}
                        </span>
                      </div>

                      {/* ITEM LAYANAN TAMBAHAN (ADD-ONS) */}
                      {enrollment.selectedAddons.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {enrollment.selectedAddons.map((selected, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[9px] font-semibold  px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded uppercase">
                              <ShieldCheck size={11} /> {selected.addon.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* TOMBOL RESOURCE (Hanya Tampil Jika Private & Lunas) */}
                      {!isPublic && isSettled && (meetingUrl || materialUrl || recordingUrl) && (
                        <div className="pt-3 mt-1 flex flex-wrap items-center gap-2 border-t border-border/40">
                          {meetingUrl && (
                            <a href={meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold  rounded bg-blue-600 hover:bg-blue-700 text-white shadow-3xs transition-colors">
                              <Video size={12} /> {"Masuk Ruang Kelas (Live)"}
                            </a>
                          )}
                          {materialUrl && (
                            <a href={materialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold  rounded border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors">
                              <FileText size={12} /> {"Unduh Materi (PDF)"}
                            </a>
                          )}
                          {recordingUrl && (
                            <a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold  rounded border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors">
                              <PlaySquare size={12} /> {"Tonton Ulang Rekaman"}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* BADGES SISTEM HARGA DAN SIKLUS TRANSAKSI (SISI KANAN) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">

                      {/* Total Amount Badge */}
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border tracking-wider flex items-center gap-1.5 ${isFree
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-background text-foreground border-border/80 shadow-3xs"
                        }`}>
                        {!isFree && <CreditCard size={11} className="text-muted-foreground" />}
                        {isFree ? "Gratis" : `Rp ${enrollment.totalAmount.toLocaleString('id-ID')}`}
                      </span>

                      {/* Status Operational Badge Berdasarkan DB Enum */}
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest">
                        {isSettled ? (
                          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1 border border-primary/10">
                            <CheckCircle2 size={12} /> {"Berhasil"}
                          </span>
                        ) : isPending ? (
                          <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/10">
                            <Hourglass size={12} className="animate-spin [animation-duration:3s]" /> {"Menunggu Pembayaran"}
                          </span>
                        ) : (
                          <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded flex items-center gap-1 border border-destructive/10">
                            <XCircle size={12} /> {"Gagal/Dibatalkan"}
                          </span>
                        )}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}