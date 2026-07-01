// src/components/auth/register-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@/schemas/auth";
import { registerUser, verifyEmailOtp, resendEmailOtp } from "@/actions/auth";
import { signIn } from "next-auth/react"; // 🌟 KUNCI: Import signIn untuk auto-login instan
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


// Import Sub-Komponen Modular
import { RegisterDataStep } from "./register-data-step";
import { RegisterOtpStep } from "./register-otp-step";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();


  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false); // State khusus untuk loading login otomatis

  // State penentu langkah modul
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      whatsapp: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedPassword = watch("password", "");
  const watchedConfirmPassword = watch("confirmPassword", "");

  // Handler Kirim Data Awal (Memicu pengiriman token ke email)
  const onDataSubmit = (data: RegisterInput) => {
    setGlobalError(null);
    setGlobalSuccess(null);
    startTransition(async () => {
      const response = await registerUser(data);
      if (!response.success) {
        setGlobalError(response.message);
        return;
      }
      setRegisteredEmail(data.email);
      setIsOtpStep(true); // Pindah ke modul OTP secara instan
    });
  };

  // 🌟 FUNCTION VERIFIKASI OTP DENGAN FITUR INSTANT AUTO-LOGIN
  const handleVerifyOtp = async (otpCode: string) => {
    const response = await verifyEmailOtp(registeredEmail, otpCode);

    if (response.success) {
      setGlobalSuccess("emailVerifiedAutoLogin");
      setIsLoggingIn(true); // Nyalakan animasi sinkronisasi login otomatis

      // Memicu NextAuth Jabat Tangan Kredensial secara senyap (Silent Authentication)
      const loginResult = await signIn("credentials", {
        email: registeredEmail,
        password: watchedPassword, // Menggunakan password yang masih tersimpan di memori state React Form
        redirect: false, // Jangan biarkan NextAuth me-refresh halaman secara kasar
      });

      if (loginResult?.error) {
        setIsLoggingIn(false);
        setGlobalError("autoLoginFailed");
        setTimeout(() => router.push("/auth/login"), 2500);
        return { success: true, message: "verifiedNoAutoLogin" };
      }

      // Jika login sukses, lompati halaman login dan hantar langsung ke dashboard/profile
      setGlobalSuccess("authSuccessRedirect");
      router.refresh(); // Segarkan token session kuki NextAuth
      setTimeout(() => {
        window.location.href = `?status=new_registration`; // Hard redirect aman untuk memastikan session ter-mount sempurna
      }, 1500);
    }

    return response;
  };

  // FUNCTION RE-SEND OTP
  const handleResendOtp = async () => {
    return await resendEmailOtp(registeredEmail);
  };

  return (
    <div className="relative w-full max-w-md bg-white/70 dark:bg-[#0f1626]/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-8 transition-all duration-300 font-sans select-none overflow-hidden group/card">

      {/* HEADER SECTION */}
      <div className="flex flex-col space-y-2 mb-6 border-b border-slate-200/60 dark:border-slate-800/50 pb-5 relative z-10">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {isOtpStep ? "verifyEmail" : "startJourney"}
          </h1>
          {!isOtpStep && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {"Sudah punya akun?"}{" "}
              <Link href={`/auth/login`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                {"Masuk di sini"}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* CALLOUT FEEDBACK STATUS */}
      {!isOtpStep && globalError && (
        <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold  rounded-xl">
          ⚠️ {globalError}
        </div>
      )}
      {globalSuccess && (
        <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold  rounded-xl flex items-center gap-2">
          {(isLoggingIn || isPending) && <Loader2 size={12} className="animate-spin shrink-0 text-emerald-500" />}
          <span>{globalSuccess}</span>
        </div>
      )}

      {/* LOADING OVERLAY SAAT PROSES LOGIN OTOMATIS BERLANGSUNG */}
      {isLoggingIn && (
        <div className="absolute inset-0 bg-white/60 dark:bg-[#070c14]/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center animate-fadeIn">
          <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide animate-pulse">
            INITIALIZING_SECURE_SESSION...
          </p>
        </div>
      )}

      {/* ── CONDITIONAL DISPATCHER VIEW ── */}
      {!isOtpStep ? (
        <form onSubmit={handleSubmit(onDataSubmit)}>
          <RegisterDataStep
            register={register}
            isPending={isPending}
            errors={errors}
            watchedPassword={watchedPassword}
            watchedConfirmPassword={watchedConfirmPassword}
          />
        </form>
      ) : (
        <RegisterOtpStep
          email={registeredEmail}
          onVerifySuccess={handleVerifyOtp}
          onResendOtp={handleResendOtp}
        />
      )}
    </div>
  );
}