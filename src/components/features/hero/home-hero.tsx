"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Compass, Cpu, Wrench, Radio, Sparkles, X, Calendar } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


export interface HeroWebinarProps {
  isNewUser?: boolean;
  upcomingWebinar?: {
    slug: string;
    title: string;
    targetDate: Date;
    speaker: {
      name: string;
      title: string;
      image: string;
    } | null;
  } | null;
  nearestWebinar?: {
    slug: string;
    title: string;
    description: string | null;
    imageUrl: string;
    sessions: {
      id: string;
      title: string;
      startDate: Date;
      endDate: Date;
      duration: string | null;
    }[];
  } | null;
}

export function HomeHero({ upcomingWebinar, nearestWebinar, isNewUser = false }: HeroWebinarProps) {



  const [isWelcomeVisible, setIsWelcomeVisible] = useState<boolean>(true);

  return (
    <section className="relative overflow-hidden py-6 lg:py-10 flex flex-col selection:bg-primary/20 font-sans transition-colors duration-300">

      {/* LAYER 1: AMBIENT GLOW BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] opacity-70" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] opacity-60" />
      </div>

      {/* ── 🌟 WELCOME REGISTRATION BANNER ── */}
      <AnimatePresence>
        {isNewUser && isWelcomeVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full mb-8 relative group z-20"
          >
            {/* Ambient Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 blur-sm rounded-2xl opacity-15 group-hover:opacity-25 transition-opacity" />

            <div className="relative w-full bg-card/40 backdrop-blur-xl border border-blue-500/20 text-foreground rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-500 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="animate-pulse text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-tight text-blue-800 dark:text-blue-400 uppercase tracking-wider">Registrasi Berhasil</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl font-medium">
                    Lengkapi profil Anda untuk mulai mengakses kurikulum dan kelas interaktif.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <Link
                  href={`/profile/edit?status=new_registration`}
                  className="group/btn h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Lengkapi Profil Sekarang</span>
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
                <button
                  onClick={() => setIsWelcomeVisible(false)}
                  className="h-9 w-9 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors border border-border/40 shadow-xs"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full relative z-10 flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* --- KOLOM KIRI: HEADINGS COPYWRITING --- */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left pointer-events-auto w-full">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.15]">
                Tingkatkan Keahlian <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-primary/70 drop-shadow-sm">
                  Profesional Anda
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Platform e-learning dengan kurikulum standar industri. Belajar langsung dari praktisi ahli.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <Link
              href={`/webinars`}
              className="group/btn bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-extrabold h-10 px-6 rounded-xl transition-all shadow-[0_8px_30px_rgb(var(--color-primary)/0.25)] hover:shadow-[0_8px_40px_rgb(var(--color-primary)/0.4)] uppercase tracking-wider flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
            >
              <span>Lihat Katalog Kelas</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>

            <div className="flex items-center gap-4 text-muted-foreground font-semibold border-l border-border/80 pl-4 hidden sm:flex h-5">
              <div className="flex items-center gap-1.5 text-[10px] hover:text-primary transition-colors cursor-pointer group">
                <Compass className="h-3 w-3 group-hover:rotate-12 transition-transform" /> <span>Geologi</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] hover:text-primary transition-colors cursor-pointer group">
                <Cpu className="h-3 w-3 group-hover:scale-105 transition-transform" /> <span>Komputasi</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] hover:text-primary transition-colors cursor-pointer group">
                <Wrench className="h-3 w-3 group-hover:-rotate-12 transition-transform" /> <span>Teknik</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- KOLOM KANAN: INTERACTIVE LIVE TIMELINE COUNTDOWN CARD --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
          className="lg:col-span-5 xl:col-start-8 relative pointer-events-auto w-full max-w-[340px] mx-auto lg:mx-0"
        >

          {upcomingWebinar ? (
            <>
              {/* BACKDROP GLOW */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-indigo-500/20 blur-2xl rounded-3xl opacity-60 pointer-events-none animate-pulse duration-3000" />

              {/* GLASS CARD */}
              <div className="relative bg-card/40 backdrop-blur-xl border border-border/60 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group/card transition-colors duration-300">

                <div className="flex justify-between items-start border-b border-border/40 pb-3">
                  <div className="space-y-2 w-full">
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-sm border border-amber-500/20 uppercase tracking-widest inline-flex items-center gap-1.5">
                      <Radio className="h-3 w-3 animate-pulse" /> Segera Hadir
                    </span>
                    <h3 className="text-sm font-bold text-foreground leading-tight tracking-tight group-hover/card:text-primary transition-colors duration-300 line-clamp-2">
                      {upcomingWebinar.title}
                    </h3>

                    {/* Nearest schedule date and time */}
                    <div className="text-[10px] text-muted-foreground font-semibold  flex items-center gap-1.5 pt-0.5">
                      <Calendar size={12} className="text-primary shrink-0" />
                      <span className="truncate">
                        {new Date(upcomingWebinar.targetDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " WIB"}
                      </span>
                    </div>
                  </div>
                </div>

                {upcomingWebinar.speaker && (
                  <div className="flex items-center gap-3 bg-muted/20 border border-border/50 p-2 rounded-xl transition-all hover:bg-muted/40">
                    <div className="w-8 h-10 rounded-lg bg-muted overflow-hidden border border-border/60 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={upcomingWebinar.speaker.name}
                        className="w-full h-full object-cover"
                        src={upcomingWebinar.speaker.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"}
                      />
                    </div>
                    <div className="text-[10px] font-medium leading-tight">
                      <p className="text-muted-foreground">Pembicara</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{upcomingWebinar.speaker.name}</p>
                    </div>
                  </div>
                )}

                <CountdownTimer targetDate={upcomingWebinar.targetDate} />

                <div className="pt-0.5">
                  <Link
                    href={`/webinars/${upcomingWebinar.slug}`}
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-700 text-white font-extrabold text-[11px] h-10 rounded-xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    DAFTAR SEKARANG
                  </Link>
                </div>
              </div>
            </>
          ) : nearestWebinar ? (
            <>
              {/* BACKDROP GLOW */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/10 blur-2xl rounded-3xl opacity-50 pointer-events-none" />

              {/* GLASS CARD WITH RUNDOWN */}
              <div className="relative bg-card/40 backdrop-blur-xl border border-border/60 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group/card transition-colors duration-300">

                <div className="border-b border-border/40 pb-3">
                  <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-sm border border-primary/20 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" /> Rundown Acara Terdekat
                  </span>
                  <h3 className="text-sm font-bold text-foreground leading-tight tracking-tight group-hover/card:text-primary transition-colors duration-300 line-clamp-2">
                    {nearestWebinar.title}
                  </h3>
                </div>

                {/* TIMELINE RUNDOWN */}
                <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-1">
                  {nearestWebinar.sessions.length > 0 ? (
                    nearestWebinar.sessions.map((session) => {
                      const sessionDateStr = new Date(session.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) + " WIB";

                      return (
                        <div key={session.id} className="relative flex gap-3 pl-3 before:absolute before:left-1 before:top-2 before:bottom-0 before:w-[1px] before:bg-border/65 last:before:hidden">
                          <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary border border-background shrink-0" />
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-foreground leading-tight">
                              {session.title}
                            </p>
                            <p className="text-[9.5px] text-muted-foreground font-semibold ">
                              {sessionDateStr} {session.duration ? `(${session.duration})` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic text-center py-4">Belum ada sesi rundown.</p>
                  )}
                </div>

                <div className="pt-0.5">
                  <Link
                    href={`/webinars/${nearestWebinar.slug}`}
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-700 text-white font-extrabold text-[11px] h-10 rounded-xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <span>Daftar / Detail Acara</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </>
          ) : (
            <div className="relative bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6 flex flex-col gap-3 text-center shadow-xl">
              <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground border border-border/50">
                <Radio className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-sm">{"Belum Ada Webinar Sedang Berlangsung"}</h3>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  {"Jelajahi program mendatang atau tonton rekaman webinar sebelumnya."}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ⏱️ OPM-RENDER: Isolated countdown component to localize state changes and avoid full hero re-renders
function CountdownTimer({ targetDate }: { targetDate: Date }) {

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const difference = target - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: d.toString().padStart(2, "0"),
        hours: h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0"),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-background/80 rounded-xl p-3 border border-border/60 text-center shadow-inner relative overflow-hidden">
      <div className="grid grid-cols-4 gap-1 text-center relative">
        {[
          { value: timeLeft.days, label: "days" },
          { value: timeLeft.hours, label: "hours" },
          { value: timeLeft.minutes, label: "minutes" },
          { value: timeLeft.seconds, label: "seconds", highlight: true },
        ].map((unit, index, arr) => (
          <div key={unit.label} className="flex items-center justify-between relative">
            <div className="w-full">
              <span className={`text-lg sm:text-xl font-bold tracking-tight block transition-colors ${unit.highlight ? "text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary)/0.3)]" : "text-foreground"
                }`}>
                {unit.value}
              </span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider block font-semibold mt-0.5">
                {unit.label}
              </span>
            </div>
            {index < arr.length - 1 && (
              <span className="text-border font-bold text-sm absolute -right-1.5 top-0.5 select-none">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}