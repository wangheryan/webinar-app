"use client";

import { useState, useTransition, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type LoginInput } from "@/schemas/login";
import { CredentialsForm } from "./credentials-form";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { validateCaptchaToken } from "@/actions/captcha";
import { checkLoginAttemptsStatus } from "@/actions/auth"; // 🌟 Import pelacak status dari server
import Link from "next/link";
import { Loader2, AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";


export function LoginCard() {
  const router = useRouter();


  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);

  // State Keamanan Dinamis
  const [requiresCaptcha, setRequiresCaptcha] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");

  const turnstileRef = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY || "";

  const isLoading = isPending || isOAuthLoading;

  // 🌟 Fungsi untuk mendeteksi jumlah percobaan setiap kali email berubah/selesai diketik
  const handleEmailBlur = async (emailValue: string) => {
    if (!emailValue) return;
    setCurrentEmail(emailValue);

    // Cek ke server apakah email ini sudah pernah salah 5x
    const isLocked = await checkLoginAttemptsStatus(emailValue);
    setRequiresCaptcha(isLocked);
  };

  const handleCredentialsSubmit = async (data: LoginInput) => {
    setErrorMsg(null);

    // 🌟 Jika status mewajibkan CAPTCHA tapi token masih kosong, blokir pengiriman
    if (requiresCaptcha && !captchaToken) {
      setErrorMsg("Selesaikan verifikasi keamanan (CAPTCHA) terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      // 1. Validasi CAPTCHA dilakukan HANYA jika pengguna sudah terdeteksi salah 5x
      if (requiresCaptcha) {
        const isHuman = await validateCaptchaToken(captchaToken);
        if (!isHuman) {
          setErrorMsg("Verifikasi keamanan gagal. Silakan coba lagi.");
          setCaptchaToken("");
          turnstileRef.current?.reset();
          return;
        }
      }

      // 2. Jalankan Logika Masuk NextAuth
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg("Email atau kata sandi tidak sesuai. Silakan periksa kembali.");
        setCaptchaToken("");
        turnstileRef.current?.reset();

        // Picu pengecekan ulang setelah kegagalan baru untuk memperbarui kondisi UI
        const checkAgain = await checkLoginAttemptsStatus(data.email);
        setRequiresCaptcha(checkAgain);
      } else {
        router.push("/");
        router.refresh();
      }
    });
  };

  const handleGoogleLogin = async () => {
    setIsOAuthLoading(true);
    setErrorMsg(null);
    try {
      await signIn("google", { callbackUrl: `` });
    } catch (err: unknown) {
      console.error("OAUTH_GOOGLE_ERROR:", err);
      setIsOAuthLoading(false);
      setErrorMsg("Gagal terhubung dengan Google. Silakan coba lagi.");
    }
  };

  return (
    <div className="relative w-full max-w-[400px] bg-white/90 dark:bg-zinc-900/70 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 select-none overflow-hidden">

      {/* BRANDING TITLE HEADER */}
      <div className="flex flex-col items-center justify-center gap-1.5 mb-5">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Lanjutkan akses ke dashboard pembelajaran Anda
        </p>
      </div>

      <hr className="border-slate-100 dark:border-zinc-800/60 mb-5" />

      {/* ERROR FEEDBACK BANNER */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/5 border border-red-500/15 text-red-600 dark:text-red-400 text-xs font-semibold  rounded-xl flex items-start gap-2 leading-relaxed">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CREDENTIALS MAIN INPUT CHANNEL */}
      <div className="space-y-4">
        {/* Mengoper handleEmailBlur ke form agar bisa didengarkan saat kolom email ditinggalkan */}
        <CredentialsForm
          onSubmit={handleCredentialsSubmit}
          isLoading={isLoading}
          onEmailBlur={handleEmailBlur}
        />
      </div>

      {/* ── 🌟 INTEGRASI WIDGET CAPTCHA KONDISIONAL (HANYA MUNCUL JIKA >= 5 GAGAL) ── */}
      {requiresCaptcha && (
        <div className="flex flex-col items-center justify-center pt-4 space-y-2 animate-fadeIn">
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-medium flex items-center gap-2 w-full justify-center">
            <ShieldAlert size={13} className="animate-pulse" />
            <span>Terlalu banyak percobaan masuk. Harap verifikasi keamanan Anda.</span>
          </div>
          <Turnstile
            ref={turnstileRef}
            siteKey={siteKey}
            options={{ theme: "auto", size: "normal" }}
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken("")}
            onExpire={() => setCaptchaToken("")}
          />
        </div>
      )}

      {!requiresCaptcha && currentEmail && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-4 text-center flex items-center justify-center gap-1 font-sans">
          <ShieldCheck size={11} /> Koneksi Aman Terenkripsi
        </p>
      )}

      {/* SEPARATOR SPLIT RADIAL BAR */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/60 dark:border-zinc-800/60" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
          <span className="bg-white dark:bg-[#151922] px-3 text-slate-400 dark:text-slate-500 rounded-full">
            Atau masuk dengan
          </span>
        </div>
      </div>

      {/* OAUTH GOOGLE GATEWAY BUTTON */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        type="button"
        className="w-full h-10 flex items-center justify-center gap-2 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-xs cursor-pointer active:scale-[0.99]"
      >
        {isOAuthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.216 1.714 15.44 1 12.24 1 5.48 1 0 6.48 0 13.2s5.48 12.2 12.24 12.2c7.055 0 11.75-4.943 11.75-11.914 0-.806-.088-1.417-.193-2.2H12.24z" />
          </svg>
        )}
        <span>
          {isOAuthLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
        </span>
      </button>

      {/* REDIRECTION SWITCH LINK */}
      <div className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        Belum memiliki akun?{" "}
        <Link href={`/auth/register`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all">
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}