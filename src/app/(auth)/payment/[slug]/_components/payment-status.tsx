"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, QrCode, Building2, ArrowLeft } from "lucide-react";

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const method = searchParams.get("method") || "VIRTUAL_ACCOUNT";
  const amount = Number(searchParams.get("amount")) || 0;
  const title = searchParams.get("title") || "Kelas Eksplorasi Minerba";

  return (
    <div className="max-w-md mx-auto bg-card text-card-foreground border border-border rounded-xl p-5 shadow-2xs text-xs space-y-5">
      {/* HEADER STATUS NOTIFIKASI */}
      <div className="text-center space-y-1.5 py-1">
        <div className="flex justify-center text-primary">
          <CheckCircle2 size={36} className="animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Invoice Berhasil Dibuat</h2>
          <p className="text-muted-foreground text-[10px] font-medium">Silakan amankan pendaftaran Anda sebelum batas waktu berakhir.</p>
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* DETAIL RINGKASAN ORDER */}
      <div className="space-y-2 p-3 bg-muted/30 border border-border/40 rounded-lg font-medium">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Program Webinar</p>
        <p className="font-bold text-foreground leading-snug truncate">{title}</p>
        <div className="flex justify-between items-center pt-2 border-t border-border/20 text-[11px]">
          <span className="text-muted-foreground">Total Tagihan:</span>
          <span className="font-bold text-primary text-sm">Rp {amount.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* STRUKTUR DINAMIS SUB-CHANNEL PEMBAYARAN */}
      <div className="space-y-2">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Petunjuk Instruksi Bayar</p>

        {method === "VIRTUAL_ACCOUNT" ? (
          <div className="border border-border rounded-lg p-3.5 space-y-2.5 bg-card">
            <div className="flex items-center gap-1.5 text-foreground font-bold">
              <Building2 size={14} className="text-primary" />
              <span>Nomor Virtual Account Bank</span>
            </div>
            <div className="bg-muted/50 p-2 rounded-md flex justify-between items-center border border-border/30">
              <code className="text-sm font-bold tracking-wider text-foreground select-all">8856081234567890</code>
              <span className="text-[8px] font-semibold bg-accent text-accent-foreground px-1.5 py-0.5 rounded border border-border/20 uppercase cursor-pointer hover:bg-accent/80 transition-colors">Salin</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Masukkan nomor rekening Virtual Account di atas melalui menu transfer m-banking atau ATM terdekat Anda.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-4 text-center bg-card">
            <div className="flex items-center justify-center gap-1.5 text-foreground font-semibold text-left">
              <QrCode size={14} className="text-primary" />
              <span>Scan QRIS Interaktif Sandbox</span>
            </div>

            {/* Simulasi Grid QR Code Menggunakan Tailwind Pure Tanpa Berat Aset Gambar */}
            <div className="w-28 h-28 mx-auto bg-muted border border-border rounded-lg flex items-center justify-center p-2 opacity-80">
              <div className="grid grid-cols-4 gap-1 w-full h-full">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 7 === 1 ? "bg-foreground" : "bg-transparent"}`} />
                ))}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-normal px-1">
              Buka aplikasi dompet digital (GoPay, Dana, OVO, LinkAja) lalu arahkan kamera pemindai ke kode QR di atas.
            </p>
          </div>
        )}
      </div>

      <div className="h-px bg-border/60" />

      {/* NAVIGASI KONTROL */}
      <div className="space-y-2">
        <button
          onClick={() => router.push("/profile")}
          className="w-full py-2 bg-foreground text-background font-bold text-center rounded-lg hover:opacity-90 transition-opacity cursor-pointer uppercase text-[9px] tracking-wider"
        >
          Lihat Kelas Saya di Profil
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground font-semibold text-[11px] transition-colors py-0.5"
        >
          <ArrowLeft size={11} /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}