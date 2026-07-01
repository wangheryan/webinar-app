import { Compass, ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function NotFound() {

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg text-center space-y-6">
        {/* Icon */}
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
          <Compass size={28} />
        </div>

        {/* 404 Badge */}
        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-3 py-1 rounded-md uppercase tracking-widest">
          ERROR 404
        </span>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-foreground uppercase tracking-tight">
            {"Halaman Tidak Ditemukan"}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {"Tautan mungkin rusak atau halaman telah dihapus."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="w-full h-10 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            {"Kembali ke Beranda"}
          </Link>
          <Link
            href="/webinars"
            className="w-full h-9 border border-border bg-background text-muted-foreground hover:text-foreground font-semibold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {"Eksplorasi Program Lain"}
          </Link>
        </div>
      </div>
    </div>
  );
}
