// src/components/auth/register-data-step.tsx
"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { User, Mail, Phone, AtSign, ArrowRight, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { RegisterInput } from "@/schemas/auth";


interface RegisterDataStepProps {
  register: UseFormRegister<RegisterInput>;
  isPending: boolean;
  errors: FieldErrors<RegisterInput>;
  watchedPassword: string;
  watchedConfirmPassword: string;
}

export function RegisterDataStep({
  register,
  isPending,
  errors,
  watchedPassword,
  watchedConfirmPassword,
}: RegisterDataStepProps) {


  return (
    <div className="space-y-4 animate-fadeIn">
      {/* NAMA LENGKAP */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          {"Nama Lengkap"} <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <User className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-200 ${errors.name ? "text-red-500" : "text-slate-400 dark:text-slate-600 group-focus-within:text-blue-500"
            }`} />
          <input
            {...register("name")}
            type="text"
            disabled={isPending}
            placeholder={"Masukkan nama lengkap Anda"}
            className={`w-full pl-9 pr-3 h-9 text-xs font-medium rounded-xl border bg-white/40 dark:bg-[#0b111e]/30 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all disabled:opacity-40 ${errors.name
              ? "border-red-500/50 focus:border-red-500 bg-red-500/[0.02]"
              : "border-slate-200 dark:border-slate-800/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
              }`}
          />
        </div>
        {errors.name && <p className="text-[10px] text-red-500 font-semibold  px-0.5 mt-1">⚠️ {errors.name.message}</p>}
      </div>

      {/* NOMOR WHATSAPP */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          {"Nomor Telepon/WhatsApp"} <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <Phone className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-200 ${errors.whatsapp ? "text-red-500" : "text-slate-400 dark:text-slate-600 group-focus-within:text-blue-500"
            }`} />
          <input
            {...register("whatsapp")}
            type="tel"
            disabled={isPending}
            placeholder={"Masukkan nomor yang aktif"}
            className={`w-full pl-9 pr-3 h-9 text-xs font-semibold rounded-xl border bg-white/40 dark:bg-[#0b111e]/30 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all disabled:opacity-40 ${errors.whatsapp
              ? "border-red-500/50 focus:border-red-500 bg-red-500/[0.02]"
              : "border-slate-200 dark:border-slate-800/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
              }`}
          />
        </div>
        {errors.whatsapp && <p className="text-[10px] text-red-500 font-semibold  px-0.5 mt-1">⚠️ {errors.whatsapp.message}</p>}
      </div>

      {/* USERNAME */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          {"Nama Pengguna"} <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <AtSign className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-200 ${errors.username ? "text-red-500" : "text-slate-400 dark:text-slate-600 group-focus-within:text-blue-500"
            }`} />
          <input
            {...register("username")}
            type="text"
            disabled={isPending}
            placeholder={"Pilih nama pengguna unik"}
            className={`w-full pl-9 pr-3 h-9 text-xs font-semibold rounded-xl border bg-white/40 dark:bg-[#0b111e]/30 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all disabled:opacity-40 ${errors.username
              ? "border-red-500/50 focus:border-red-500 bg-red-500/[0.02]"
              : "border-slate-200 dark:border-slate-800/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
              }`}
          />
        </div>
        {errors.username && <p className="text-[10px] text-red-500 font-semibold  px-0.5 mt-1">⚠️ {errors.username.message}</p>}
      </div>

      {/* EMAIL */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          {"Alamat Email"} <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <Mail className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-200 ${errors.email ? "text-red-500" : "text-slate-400 dark:text-slate-600 group-focus-within:text-blue-500"
            }`} />
          <input
            {...register("email")}
            type="email"
            disabled={isPending}
            placeholder={"Masukkan email kerja atau pribadi"}
            className={`w-full pl-9 pr-3 h-9 text-xs font-medium rounded-xl border bg-white/40 dark:bg-[#0b111e]/30 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all disabled:opacity-40 ${errors.email
              ? "border-red-500/50 focus:border-red-500 bg-red-500/[0.02]"
              : "border-slate-200 dark:border-slate-800/60 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
              }`}
          />
        </div>
        {errors.email && <p className="text-[10px] text-red-500 font-semibold  px-0.5 mt-1">⚠️ {errors.email.message}</p>}
      </div>

      {/* PASSWORD & KONFIRMASI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordInput
          label={"Kata sandi minimal 8 karakter"}
          register={register("password")}
          disabled={isPending}
          error={errors.password?.message}
        />
        <PasswordInput
          label={"Konfirmasi Kata Sandi"}
          register={register("confirmPassword")}
          disabled={isPending}
          error={errors.confirmPassword?.message}
        />
      </div>

      <PasswordStrengthIndicator
        passwordWatched={watchedPassword}
        confirmPasswordWatched={watchedConfirmPassword}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="group/btn w-full h-10 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin text-white" />
              <span>{"Mengirim Kode Autentikasi..."}</span>
            </>
          ) : (
            <>
              <span>{"Kirim Kode Verifikasi"}</span>
              <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}