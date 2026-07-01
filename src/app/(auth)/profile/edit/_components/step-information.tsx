// src/app/profile/edit/_components/step-information.tsx
"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { User, Phone, Mail, Briefcase, Link2, HelpCircle, User2Icon } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { EditProfileInput } from "./types";

interface StepInformationProps {
  register: UseFormRegister<EditProfileInput>;
  isPending: boolean;
  errors: FieldErrors<EditProfileInput>;
}

export function StepInformation({ register, isPending, errors }: StepInformationProps) {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Blok Kredensial */}
      <div className="space-y-4 pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-3">
          <User2Icon size={14} /> Informasi Profil
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* USERNAME */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">
              Username <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground/60">@</span>
              <input
                {...register("username")}
                type="text"
                disabled={isPending}
                className={`w-full h-9 pl-7 pr-3 bg-muted/20 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${errors.username ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  }`}
                placeholder="username"
              />
            </div>
            {errors.username?.message && (
              <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.username.message}</p>
            )}
          </div>

          {/* EMAIL (DIKUNCI / READ-ONLY KARENA OAUTH GOOGLE) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">
                Alamat Email Utama <span className="text-destructive">*</span>
              </label>
              <span className="text-[9px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                OAuth Google
              </span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
              <input
                {...register("email")}
                type="email"
                readOnly // 🌟 Mengunci input agar tidak bisa diedit
                className="w-full h-9 pl-9 pr-3 bg-muted/60 border border-border rounded-lg text-xs font-semibold  text-muted-foreground opacity-75 cursor-not-allowed focus:outline-none"
                title="Email ini terikat permanen dengan akun Google OAuth Anda."
              />
            </div>
            {errors.email?.message ? (
              <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">{errors.email.message}</p>
            ) : (
              <p className="text-[9px] text-muted-foreground/60 italic px-1 mt-0.5">Email tidak dapat diubah karena terhubung dengan Google.</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Gunakan Password Untuk Login</label>
              <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
            </div>
            <PasswordInput register={register("password")} disabled={isPending} />
            {errors.password?.message && (
              <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* PROFILE DETAIL BLOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* NAMA LENGKAP */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">
              Nama Lengkap <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <input
                {...register("name")}
                type="text"
                disabled={isPending}
                className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs font-semibold  focus:outline-none transition-colors ${errors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  }`}
              />
            </div>
            {errors.name?.message && (
              <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* WHATSAPP */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">
              Nomor WhatsApp Aktif <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <input
                {...register("whatsapp")}
                type="tel"
                disabled={isPending}
                className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${errors.whatsapp ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  }`}
                placeholder="628xxxxxxxx"
              />
            </div>
            {errors.whatsapp?.message && (
              <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">{errors.whatsapp.message}</p>
            )}
          </div>

          {/* LINKEDIN */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">LinkedIn Profile URL</label>
              <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
            </div>
            <div className="relative">
              <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <input
                {...register("linkedinUrl")}
                type="url"
                disabled={isPending}
                className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors ${errors.linkedinUrl ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  }`}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            {errors.linkedinUrl?.message && (
              <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">{errors.linkedinUrl.message}</p>
            )}
          </div>

          {/* ASAL SUMBER INFO */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">
              Asal Sumber Info <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <HelpCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <select {...register("infoSource")} disabled={isPending} className="w-full h-9 pl-9 pr-3 bg-muted/20 border border-border rounded-lg text-xs font-semibold  focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="LINKEDIN">LinkedIn</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="ADS">Google / Meta Advertisements</option>
                <option value="MARKETING">Event / Rekomendasi Teman</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CLASSIFICATION BLOCK */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-3">
          <Briefcase size={14} /> Klasifikasi
        </h3>
        <div className="space-y-2">
          <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">
            Status <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
            <select {...register("status")} disabled={isPending} className="w-full h-10 pl-9 pr-3 bg-primary/5 border border-primary/20 text-primary dark:text-sky-400 font-semibold rounded-lg text-xs focus:outline-none focus:border-primary appearance-none cursor-pointer shadow-2xs">
              <option value="MAHASISWA">MAHASISWA</option>
              <option value="PROFESSIONAL">PROFESSIONAL</option>
              <option value="GENERAL">GENERAL / UMUM (Praktisi Non-Tambang)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}