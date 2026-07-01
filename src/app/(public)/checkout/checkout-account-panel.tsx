// src/app/(public)/checkout/checkout-account-panel.tsx
"use client";

import Link from "next/link";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { type RegisterInput } from "@/schemas/auth";
import { RegisterOtpStep } from "../auth/register/register-otp-step";
import {
  Loader2, ShieldCheck, Users, LogIn, Mail, Phone,
  User, KeyRound, Eye, EyeOff, AtSign, CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface CurrentUser {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  image?: string | null;
}

interface CheckoutAccountPanelProps {
  currentUser: CurrentUser | undefined;
  webinarSlug: string;
  isOtpStep: boolean;
  registeredEmail: string;
  globalError: string | null;
  globalSuccess: string | null;
  isLoggingIn: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  errors: FieldErrors<RegisterInput>;
  register: UseFormRegister<RegisterInput>;
  onRegistrationSubmit: (e: React.FormEvent) => void;
  onVerifyOtp: (otpCode: string) => Promise<{ success: boolean; message: string }>;
  onResendOtp: () => Promise<{ success: boolean; message: string }>;
}

function AvatarInitials({ name }: { name?: string | null }) {
  const initials = name
    ? name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "?";
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm shadow-primary/30 shrink-0">
      {initials}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-border/30 last:border-0">
      <span className="text-[10.5px] text-muted-foreground font-medium shrink-0">{label}</span>
      <span className="text-[10.5px] font-semibold  text-foreground text-right truncate max-w-[180px]">{value}</span>
    </div>
  );
}

function FormField({
  id,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  registration,
  error,
  disabled,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  registration: ReturnType<UseFormRegister<RegisterInput>>;
  error?: string;
  disabled?: boolean;
}) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        <Icon size={10} />
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          {...registration}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full h-9 pl-3 pr-${isPassword ? "8" : "3"} rounded-lg border text-[11px] text-foreground bg-card
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary 
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-muted-foreground/50
            transition-all duration-150
            ${error ? "border-rose-400 bg-rose-500/5 focus:ring-rose-400/20 focus:border-rose-400" : "border-border/60 hover:border-border"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[9.5px] text-rose-500 font-semibold  flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutAccountPanel({
  currentUser,
  webinarSlug,
  isOtpStep,
  registeredEmail,
  globalError,
  globalSuccess,
  isLoggingIn,
  isPending,
  isSubmitting,
  errors,
  register,
  onRegistrationSubmit,
  onVerifyOtp,
  onResendOtp,
}: CheckoutAccountPanelProps) {


  /* ── LOGGED IN STATE ── */
  if (currentUser) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Panel header */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10">
            <ShieldCheck size={13} className="text-emerald-500" />
          </div>
          <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
            {"Akun Terdaftar"}
          </h3>
          <div className="ml-auto px-2 py-0.5 bg-emerald-500/10 rounded-full">
            <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{"Terverifikasi"}</span>
          </div>
        </div>

        {/* User info card */}
        <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 border border-emerald-500/15 rounded-xl">
          <AvatarInitials name={currentUser.name} />
          <div className="flex-1 min-w-0 space-y-0.5">
            <InfoRow label={"Nama Lengkap"} value={currentUser.name} />
            <InfoRow label={"Email"} value={currentUser.email} />
            {currentUser.whatsapp && (
              <InfoRow label={"Nomor Telepon/WhatsApp"} value={currentUser.whatsapp} />
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
          <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
          {"Sistem akan menggunakan data akun Anda untuk pendaftaran ini."}
        </p>
      </div>
    );
  }

  /* ── UNAUTHENTICATED STATE ── */
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">

      {/* Subtle decorative gradient blob */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />

      {/* Loading overlay when auto-logging in */}
      {isLoggingIn && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3 rounded-2xl">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <Sparkles size={16} className="absolute inset-0 m-auto text-primary" />
          </div>
          <p className="text-[11px] font-semibold text-foreground tracking-wide animate-pulse">
            {"Mengamankan Akses Anda..."}
          </p>
        </div>
      )}

      {/* Panel header */}
      <div className="border-b border-border/40 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Users size={13} className="text-primary" />
          </div>
          <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
            {isOtpStep ? "verifyEmail" : "newAccountForm"}
          </h3>
        </div>
        {!isOtpStep && (
          <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
            {"Sudah punya akun?"}{" "}
            <Link
              href={`/auth/login?callback=/checkout?webinar=${webinarSlug}`}
              className="inline-flex items-center gap-1 text-primary font-semibold hover:underline underline-offset-2"
            >
              <LogIn size={10} />
              {"Masuk di sini"}
            </Link>
          </p>
        )}
      </div>

      {/* Alert banners */}
      {globalError && (
        <div className="p-3 bg-rose-500/8 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-semibold  rounded-xl flex items-start gap-2">
          <span className="shrink-0 mt-px">⚠️</span>
          <span>{globalError}</span>
        </div>
      )}
      {globalSuccess && (
        <div className="p-3 bg-emerald-500/8 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold  rounded-xl flex items-center gap-2">
          <Loader2 size={12} className="animate-spin shrink-0 text-emerald-500" />
          <span>{globalSuccess}</span>
        </div>
      )}

      {/* Form or OTP step */}
      {!isOtpStep ? (
        <form onSubmit={onRegistrationSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              id="name"
              label={"Nama Lengkap"}
              icon={User}
              placeholder={"Contoh: Budi Santoso"}
              registration={register("name")}
              error={errors.name?.message}
              disabled={isPending}
            />
            <FormField
              id="whatsapp"
              label={"Nomor Telepon/WhatsApp"}
              icon={Phone}
              placeholder={"Contoh: 081234567890"}
              registration={register("whatsapp")}
              error={errors.whatsapp?.message}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              id="username"
              label={"Nama Pengguna"}
              icon={AtSign}
              placeholder={"Contoh: budi_s"}
              registration={register("username")}
              error={errors.username?.message}
              disabled={isPending}
            />
            <FormField
              id="email"
              label={"Alamat Email"}
              icon={Mail}
              type="email"
              placeholder={"Contoh: budi@perusahaan.com"}
              registration={register("email")}
              error={errors.email?.message}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              id="password"
              label={"Kata Sandi"}
              icon={KeyRound}
              type="password"
              placeholder={"Masukkan kata sandi rahasia"}
              registration={register("password")}
              error={errors.password?.message}
              disabled={isPending}
            />
            <FormField
              id="confirmPassword"
              label={"Konfirmasi Kata Sandi"}
              icon={KeyRound}
              type="password"
              placeholder={"Ulangi kata sandi Anda"}
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isSubmitting}
            className="w-full h-9 mt-2 relative overflow-hidden rounded-xl font-bold uppercase text-[10px] tracking-widest
              bg-foreground text-background dark:bg-white dark:text-black
              hover:opacity-90 active:scale-[0.99]
              flex items-center justify-center gap-1.5
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 cursor-pointer
              shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                {"Mengirim OTP..."}
              </>
            ) : (
              "registerAndContinue"
            )}
          </button>
        </form>
      ) : (
        <RegisterOtpStep
          email={registeredEmail}
          onVerifySuccess={onVerifyOtp}
          onResendOtp={onResendOtp}
        />
      )}
    </div>
  );
}
