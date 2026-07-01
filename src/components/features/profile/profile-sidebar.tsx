// src/app/profile/_components/profile-sidebar.tsx
"use client";

import {
  Terminal, Shield, Tv, Clock, ExternalLink, Award, Lock,
  GraduationCap, Briefcase, UserCheck,
  Mail, Phone, Eye
} from "lucide-react";


// 🌟 PERBAIKAN 1: Tipe data String Literal Unions yang aman untuk browser (Turbopack & Linter Safe)
type UserRole = "ADMINISTRATOR" | "PARTICIPANT" | string;

interface ProfileSidebarProps {
  email: string | null;
  whatsapp: string | null;
  linkedinUrl: string | null;
  totalWebinars: number;
  totalHours: number;
  totalCertificates: number;
  isPublic: boolean;
  userRole: UserRole;
  // Gabungan rekam akademik & profesional hasil denormalisasi
  academicProfile: {
    institution: string | null;
    major: string | null;
    entryYear: number | null;
    semester: number | null;
    graduationYear: number | null;
  } | null;
  professionalProfile: {
    companyName: string | null;
    jobTitle: string | null;
    sector: string | null;
    kcmiNumber: string | null;
    yearsOfExperience: number | null;
  } | null;
}

export function ProfileSidebar({
  email,
  whatsapp,
  linkedinUrl,
  totalWebinars,
  totalHours,
  totalCertificates,
  isPublic,
  userRole,
  academicProfile, // Diterima sebagai objek terpisah rata dari page server
  professionalProfile,
}: ProfileSidebarProps) {

  // 🌟 PERBAIKAN 2: Evaluasi data dipetakan langsung dari props flat hasil destrukturisasi
  const hasAcademicData = !!academicProfile?.institution;
  const hasProfessionalData = !!professionalProfile?.companyName;
  const isParticipant = userRole === "PARTICIPANT";


  // 🌟 PERBAIKAN 3: Pindahkan posisi helper masking ke atas sebelum blok return JSX
  const userMaskingHandler = (val: string | null, isEmail: boolean): string => {
    if (!val) return "—";
    if (isPublic) {
      if (isEmail) {
        const [local, domain] = val.split("@");
        if (!local || !domain) return val;
        return `${local.substring(0, 3)}***@${domain}`;
      }
      return `${val.substring(0, 4)}********`;
    }
    return val;
  };

  return (
    <div className="lg:col-span-3 w-full select-none text-[11.5px] text-foreground antialiased">

      {/* ── CARD UTAMA: DOCUMENT PROFILE (RESPONSIVE GRID HUB) ── */}
      <div className="bg-card border border-border rounded-xl p-3 space-y-3 shadow-2xs w-full">

        {/* COMPACT TOP BAR */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-primary" /> {"Informasi Kontak"}
          </h3>
          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded tracking-wider border ${isPublic ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" : "text-rose-500 bg-rose-500/5 border-rose-500/10"}`}>
            {isPublic ? <Eye size={9} /> : <Lock size={9} />} {isPublic ? "public" : "private"}
          </span>
        </div>

        {/* 🌟 PERBAIKAN GRID & DIVIDE LAYOUT: Modern Panels */}
        <div className="grid grid-cols-1 gap-3">

          {/* Sektor 1: Kontak Dasar */}
          <div className="space-y-2 w-full bg-muted/20 p-3 rounded-xl border border-border/30 hover:border-primary/20 transition-colors shadow-3xs">
            <div className="grid grid-cols-[85px_1fr] items-center gap-2">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" /> {"Email"}
              </span>
              <span className="font-semibold  text-foreground break-all">{userMaskingHandler(email, true)}</span>
            </div>

            <div className="grid grid-cols-[85px_1fr] items-center gap-2">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" /> {"Nomor Telepon/WhatsApp"}
              </span>
              <span className="font-semibold  text-foreground">{userMaskingHandler(whatsapp, false)}</span>
            </div>

            {isParticipant && (
              <div className="grid grid-cols-[85px_1fr] items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-semibold flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 shrink-0" /> {"Status Akun"}
                </span>
                <span className="font-semibold text-primary dark:text-sky-400 uppercase tracking-widest text-[10px]">{"Terverifikasi"}</span>
              </div>
            )}
          </div>

          {/* Sektor 2: Dokumen Pendidikan (Kampus / Mahasiswa) */}
          {hasAcademicData && academicProfile && (
            <div className="space-y-1.5 w-full bg-muted/20 p-3 rounded-xl border border-border/30 hover:border-primary/20 transition-colors shadow-3xs">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-border/40 pb-2">
                <GraduationCap className="h-4 w-4 shrink-0" /> {"Latar Belakang Pendidikan"}
              </span>

              <div className="grid grid-cols-[85px_1fr] items-start gap-2">
                <span className="text-muted-foreground font-medium">{"Institusi/Universitas"}</span>
                <span className="font-semibold text-foreground leading-tight">{academicProfile.institution}</span>
              </div>

              <div className="grid grid-cols-[85px_1fr] items-start gap-2">
                <span className="text-muted-foreground font-medium">{"Jurusan/Program Studi"}</span>
                <span className="font-semibold  text-foreground leading-tight">{academicProfile.major || "—"}</span>
              </div>

              <div className="grid grid-cols-[85px_1fr] items-start gap-2">
                <span className="text-muted-foreground font-medium">{"Semester/Tahun Masuk"}</span>
                <span className="font-semibold  text-foreground leading-none">{academicProfile.semester || "—"}</span>
              </div>
            </div>
          )}

          {/* Sektor 3: Dokumen Profesional (Praktisi Industri Tambang) */}
          {hasProfessionalData && professionalProfile && (
            <div className="space-y-1.5 w-full bg-muted/20 p-3 rounded-xl border border-border/30 hover:border-primary/20 transition-colors shadow-3xs">
              <div className="flex items-center justify-between gap-2 mb-3 border-b border-border/40 pb-2">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" /> {"Latar Belakang Karir"}
                </span>
                {professionalProfile.kcmiNumber && (
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md tracking-wider shrink-0">CPI</span>
                )}
              </div>

              <div className="grid grid-cols-[85px_1fr] items-start gap-2">
                <span className="text-muted-foreground font-medium">{"Nama Perusahaan"}</span>
                <span className="font-semibold text-foreground leading-tight">{professionalProfile.companyName}</span>
              </div>

              <div className="grid grid-cols-[85px_1fr] items-start gap-2">
                <span className="text-muted-foreground font-medium">{"Posisi/Jabatan"}</span>
                <span className="font-semibold  text-foreground leading-tight">{professionalProfile.jobTitle}</span>
              </div>

              <div className="grid grid-cols-[85px_1fr] items-start gap-2">
                <span className="text-muted-foreground font-medium">{"Pengalaman Kerja"}</span>
                <span className="font-semibold  text-foreground leading-none">{professionalProfile.yearsOfExperience || 0} {"Tahun"}</span>
              </div>

              <div className="grid grid-cols-[85px_1fr] items-start gap-2">
                <span className="text-muted-foreground font-medium">{"Sektor Industri"}</span>
                <span className="font-semibold  text-foreground leading-tight">{professionalProfile.sector || "—"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sektor 4: Tautan Luar LinkedIn */}
        {linkedinUrl && (
          <div className="pt-2">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-8 border border-border bg-muted/30 hover:bg-muted text-foreground font-semibold text-[11px] rounded-lg tracking-wide transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs active:scale-[0.98]"
            >
              <span>{"Lihat Profil LinkedIn"}</span>
              <ExternalLink size={12} className="text-muted-foreground shrink-0" />
            </a>
          </div>
        )}
      </div>

      {/* ── CARD METRIK STATISTICS (SINKRONISASI LAYOUT SIDEBAR MULTI-GAWAI) ── */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-2xs w-full text-xs antialiased text-foreground mt-4">
        <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-primary" /> {"Riwayat Pencapaian"}
          </h3>
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
            <Eye size={9} /> {"Publik"}
          </span>
        </div>

        <div className="space-y-2 w-full mt-3">

          <div className="flex justify-between items-center bg-muted/20 px-3 py-2.5 rounded-lg border border-border/30 hover:border-primary/20 transition-colors shadow-3xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Tv className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" /> {"Webinar Diikuti"}
            </span>
            <span className="font-semibold text-foreground">{totalWebinars}</span>
          </div>

          <div className="flex justify-between items-center bg-muted/20 px-3 py-2.5 rounded-lg border border-border/30 hover:border-primary/20 transition-colors shadow-3xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" /> {"Jam Pembelajaran"}
            </span>
            <span className="font-semibold text-foreground">{totalHours}</span>
          </div>

          <div className="flex justify-between items-center bg-emerald-500/5 px-3 py-2.5 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors shadow-3xs">
            <span className="text-emerald-600/80 dark:text-emerald-400/80 font-medium flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 shrink-0" /> {"Sertifikat Diperoleh"}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalCertificates}</span>
          </div>

        </div>
      </div>

    </div>
  );
}