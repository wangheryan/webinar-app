"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  useEffect(() => {
    console.error("❌ Unhandled application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg text-center space-y-6">
        {/* Icon */}
        <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-foreground uppercase tracking-tight">
            {"Terjadi Kesalahan Sistem"}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {"Kami tidak dapat memproses permintaan Anda saat ini. Tim kami telah dihubungi."}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/60 pt-1">
              {"Kode Kesalahan:"}: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={reset}
            className="w-full h-10 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            {"Muat Ulang Halaman"}
          </button>
          <Link
            href="/"
            className="w-full h-9 border border-border bg-background text-muted-foreground hover:text-foreground font-semibold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={13} />
            {"Kembali ke Beranda"}
          </Link>
        </div>
      </div>
    </div>
  );
}
