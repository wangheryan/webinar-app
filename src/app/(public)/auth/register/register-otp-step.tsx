"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Loader2, ShieldCheck, RefreshCw, MailWarning, Terminal } from "lucide-react";


interface RegisterOtpStepProps {
  email: string;
  onVerifySuccess: (otpCode: string) => Promise<{ success: boolean; message: string }>;
  onResendOtp: () => Promise<{ success: boolean; message: string }>;
}

export function RegisterOtpStep({ email, onVerifySuccess, onResendOtp }: RegisterOtpStepProps) {

  const [pins, setPins] = useState<string[]>(new Array(6).fill(""));
  const [isPending, startTransition] = useTransition();
  const [localFeedback, setLocalFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Array referensi untuk mengatur auto-focus lompatan input pins secara dinamis
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Timer cooldown pengiriman ulang OTP untuk mencegah spamming gateway
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handler perubahan karakter pada pin individual
  const handlePinChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) return;

    const newPins = [...pins];
    // Ambil karakter terakhir jika pengguna mengetik cepat
    newPins[index] = cleanValue.substring(cleanValue.length - 1);
    setPins(newPins);

    // Auto-focus bergeser maju ke kotak berikutnya jika tersedia
    if (index < 5 && cleanValue !== "") {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 🌟 PERBAIKAN: Parameter pertama menerima event keyboard utuh agar properti internal (e.key) valid secara strict
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      // Jika kotak aktif kosong dan bukan kotak pertama, hapus kotak sebelumnya dan mundurkan fokus
      if (pins[index] === "" && index > 0) {
        const newPins = [...pins];
        newPins[index - 1] = "";
        setPins(newPins);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Jika kotak aktif ada isinya, hapus isi kotak tersebut
        const newPins = [...pins];
        newPins[index] = "";
        setPins(newPins);
      }
    }
  };

  // Mendukung aksi salin-tempel (Paste) otomatis memecah 6 digit kode
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").substring(0, 6);

    if (pastedData.length === 6) {
      const newPins = pastedData.split("");
      setPins(newPins);
      inputRefs.current[5]?.focus();
    }
  };

  const combinedOtp = pins.join("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (combinedOtp.length < 6) return;

    setLocalFeedback(null);
    startTransition(async () => {
      const response = await onVerifySuccess(combinedOtp);
      setLocalFeedback(response);
      if (!response.success) {
        // Jika gagal verifikasi, bersihkan pin dan kembalikan fokus ke kotak pertama
        setPins(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    });
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setLocalFeedback(null);
    startTransition(async () => {
      const response = await onResendOtp();
      setLocalFeedback(response);
      if (response.success) {
        setResendTimer(60); // Set cooldown 60 detik jika berhasil terkirim ulang
      }
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans">

      {/* INFO CARD TELEMETRY PROKEDUR */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex gap-3 items-start">
        <MailWarning className="h-5 w-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            {"Kode telah dikirim ke email Anda"}
            <span className="text-xs font-semibold text-sky-600 px-2">
              {email}
            </span>
          </p>
        </div>
      </div>

      {/* CALLOUT FEEDBACK BANNER */}
      {localFeedback && (
        <div className={`p-3.5 border rounded-xl text-xs font-semibold  flex items-center gap-2 ${localFeedback.success
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
          }`}>
          <Terminal size={13} className="shrink-0" />
          <span>{localFeedback.message}</span>
        </div>
      )}

      {/* FORM INPUT ENGINE GRID PIN SEGMENTED */}
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-3">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 block text-center">
            {"Masukkan Kode Akses"}
          </label>

          {/* 6 SEGMENTED BOX PIN INTERAKTIF LAYOUT */}
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {pins.map((pin, index) => (
              <input
                key={index}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={1}
                value={pin}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                onChange={(e) => handlePinChange(e.target.value, index)}

                // 🌟 PERBAIKAN: Melemparkan objek event 'e' seutuhnya agar sinkron dengan tipe data parameter fungsinya
                onKeyDown={(e) => handleKeyDown(e, index)}

                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isPending}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-base sm:text-lg font-bold rounded-xl border bg-white dark:bg-[#0b111e]/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none transition-all focus:ring-4 focus:ring-blue-500/5 ${localFeedback && !localFeedback.success
                  ? "border-red-500/50 bg-red-500/5 text-red-500 focus:border-red-500"
                  : pin !== ""
                    ? "border-blue-500 dark:border-blue-500/60 bg-blue-500/[0.01] text-blue-600 dark:text-blue-400 font-extrabold"
                    : "border-slate-200 dark:border-slate-800/60 focus:border-blue-500"
                  }`}
                placeholder="•"
              />
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON ACTIONS */}
        <button
          type="submit"
          disabled={combinedOtp.length < 6 || isPending}
          className="w-full h-10 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : (
            <>
              <ShieldCheck size={14} />
              <span>{"Verifikasi Kode Sekarang"}</span>
            </>
          )}
        </button>
      </form>

      {/* COOLDOWN RE-SEND CONTROLLER ACTIONS */}
      <div className="text-center pt-1">
        <button
          type="button"
          disabled={isPending || resendTimer > 0}
          onClick={handleResend}
          className={`text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${resendTimer > 0
            ? "text-slate-400 dark:text-slate-600"
            : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
        >
          <RefreshCw size={12} className={isPending ? "animate-spin" : ""} />
          <span>
            {resendTimer > 0
              ? "resendAvailableIn".replace("{seconds}", resendTimer.toString())
              : "resendToken"}
          </span>
        </button>
      </div>

    </div>
  );
}