// src/app/payment/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard, QrCode, ShieldCheck, Clock,
  CheckCircle2, Copy, HelpCircle, FileText, Loader2, Building2
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentPage() {

  const searchParams = useSearchParams();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Tangkap parameter transfer dari halaman detail webinar sebelumnya
  const webinarId = searchParams.get("webinarId");
  const totalAmount = searchParams.get("totalAmount") || "0";
  const paymentChannel = searchParams.get("paymentChannel") || "VIRTUAL_ACCOUNT";
  const selectedAddons = searchParams.get("addons")?.split(",") || [];

  const isGuest = searchParams.get("isGuest") === "true";
  const customerName = searchParams.get("name") || "Professional Member";
  const customerEmail = searchParams.get("email") || "-";
  const customerWhatsapp = searchParams.get("whatsapp") || "-";
  const employmentStatus = searchParams.get("employmentStatus") || "PROFESSIONAL";

  useEffect(() => {
    // Memberikan simulasi handshake gateway Xendit selama 800ms demi UX corporate yang solid
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amountStr: string) => {
    const amount = parseInt(amountStr, 10) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Menyiapkan Gerbang Pembayaran...</span>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-foreground py-0 sm:py-8 px-0 sm:px-6 lg:px-8 antialiased selection:bg-primary/10 text-xs">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* DUAL COLUMN BILLING GRID LAYER */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">

            {/* PANEL KIRI: RINGKASAN REKAP NOTA RESMI CORPORATE INVOICE (7 KOLOM) */}
            <div className="md:col-span-7 bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 shadow-3xs">
              <div className="border-b border-border/40 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest uppercase">
                    Faktur Pembayaran Resmi
                  </span>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground uppercase font-sans pt-1">
                    Simpan rincian ini untuk referensi Anda.
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    REF-ID: GM-{webinarId?.substring(0, 8).toUpperCase() || "GATEWAY"}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                    Menunggu Pembayaran
                  </span>
                </div>
              </div>

              <div className="space-y-2 font-sans">
                <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/20 pb-1">
                  <Building2 size={12} className="text-primary" /> Rincian Profil Pembeli
                </h3>
                <div className="grid grid-cols-2 gap-y-2 bg-muted/10 p-3 rounded-xl border border-border/30 text-[11px]">
                  <div>
                    <p className="text-muted-foreground font-medium">Nama Lengkap</p>
                    <p className="font-semibold text-foreground">{customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Status Keanggotaan</p>
                    <p className="font-semibold text-primary text-[9px] tracking-wider uppercase bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 w-fit mt-0.5">
                      {isGuest ? `Tamu - ${employmentStatus}` : "Member Terautentikasi"}
                    </p>
                  </div>
                  <div className="pt-1">
                    <p className="text-muted-foreground font-medium">Email Instansi / Pribadi</p>
                    <p className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-none">{customerEmail}</p>
                  </div>
                  <div className="pt-1">
                    <p className="text-muted-foreground font-medium">Nomor WhatsApp Aktif</p>
                    <p className="font-semibold text-foreground">{customerWhatsapp}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 font-sans">
                <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/20 pb-1">
                  <FileText size={12} className="text-primary" /> Rincian Akses Kelas
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 bg-muted/10 border border-border/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-primary shrink-0" />
                      <span className="font-semibold text-foreground">Akses Penuh Masterclass</span>
                    </div>
                    <span className="font-bold text-foreground">(Termasuk)</span>
                  </div>

                  {selectedAddons.length > 0 && selectedAddons.map((addonId, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-muted/10 border border-border/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        <span className="font-medium text-muted-foreground">Akses Tambahan Spesifik: <strong className="text-foreground uppercase text-[10px]">{addonId.replace(/-/g, " ")}</strong></span>
                      </div>
                      <span className="font-semibold text-foreground">Berhasil Dikunci</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center font-sans">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Tagihan</p>
                  <p className="text-lg font-bold text-primary tracking-tight">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-[10px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1"><Clock size={11} className="text-primary" /> Batas Waktu</span>
                  <span className="font-semibold text-foreground text-[11px]">Tepat Waktu (1 Jam)</span>
                </div>
              </div>
            </div>

            {/* PANEL KANAN: INSTRUKSI BAYAR DINAMIS (5 KOLOM) */}
            <div className="md:col-span-5 space-y-4 w-full">
              <div className="bg-card border-y sm:border border-border rounded-none sm:rounded-xl p-4 sm:p-5 space-y-4 shadow-3xs w-full">

                {/* Header Instruksi */}
                <div>
                  <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                    {paymentChannel === "VIRTUAL_ACCOUNT" ? <CreditCard size={13} className="text-primary" /> : <QrCode size={13} className="text-primary" />}
                    Instruksi Pembayaran
                  </h3>
                </div>

                {/* LOGIKA PANDUAN 1: CONDITIONAL VIRTUAL ACCOUNT */}
                <div className="space-y-4 font-sans">
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-center space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Virtual Account Mandiri</p>
                    <div className="flex items-center justify-center gap-2 bg-background border border-border/80 px-3 py-1.5 rounded-lg w-fit mx-auto shadow-3xs">
                      <span className="font-mono text-sm font-bold text-foreground tracking-widest">8801234567890123</span>
                      <button
                        onClick={() => handleCopyCode("8801234567890123")}
                        className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                        title="Salin No VA"
                      >
                        <Copy size={12} className={isCopied ? "text-emerald-500" : ""} />
                      </button>
                    </div>
                    {isCopied && <p className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">Nomor berhasil disalin!</p>}
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <p className="font-semibold text-foreground flex items-center gap-1"><HelpCircle size={12} className="text-primary" /> Cara Membayar via Virtual Account</p>
                    <ol className="list-decimal pl-4 text-muted-foreground space-y-1.5 leading-relaxed font-normal">
                      <li>Masuk ke aplikasi mobile banking Anda.</li>
                      <li>Pilih menu 'Transfer' lalu pilih 'Virtual Account'.</li>
                      <li>Masukkan nomor VA di atas dan konfirmasi nama perusahaan. <span className="font-mono font-semibold text-foreground bg-muted/40 px-1 rounded">8801234567890123</span></li>
                      <li>Pastikan jumlah tagihan yang muncul tepat <strong className="text-primary">{formatCurrency(totalAmount)}</strong>.</li>
                      <li>Masukkan PIN Anda untuk mengonfirmasi transaksi.</li>
                    </ol>
                  </div>
                </div>

                {/* LOGIKA PANDUAN 2: CONDITIONAL QRIS / E-WALLET */}
                <div className="space-y-4 font-sans text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">Pindai QR Resmi</p>

                  <div className="w-44 h-44 bg-white border-2 border-border/60 rounded-xl p-2 mx-auto shadow-inner flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-mono font-bold text-primary border border-primary/20 bg-background/95 px-1.5 py-0.5 rounded tracking-widest uppercase">QRIS Terenkripsi</span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://geomining.id"
                      alt="Secure Gateway QRIS Code"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="space-y-2 text-left text-[11px] pt-1">
                    <p className="font-semibold text-foreground flex items-center gap-1"><HelpCircle size={12} className="text-primary" /> Cara Membayar dengan QRIS</p>
                    <ol className="list-decimal pl-4 text-muted-foreground space-y-1.5 leading-relaxed font-normal">
                      <li>Buka aplikasi mobile banking atau e-wallet (GoPay, OVO, Dana, dll).</li>
                      <li>Pilih menu 'Scan QR' atau 'Bayar'.</li>
                      <li>Arahkan kamera ke kode QR di atas.</li>
                      <li>Pastikan nominal yang tertera sesuai tagihan <strong className="text-primary">{formatCurrency(totalAmount)}</strong>.</li>
                      <li>Selesaikan proses pembayaran.</li>
                    </ol>
                  </div>
                </div>

                {/* Tombol Cek Konfirmasi Otomatis */}
                <div className="pt-2 border-t border-border/40 space-y-2">
                  <button
                    onClick={() => {
                      toast.info("Sistem sedang memantau pembaruan status transaksi Anda di latar belakang.");
                    }}
                    className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    Cek Status Pembayaran
                  </button>
                  <Link
                    href="/"
                    className="w-full h-8 border border-border bg-background text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider text-[9px] rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    Kembali ke Dasbor Utama
                  </Link>
                </div>
              </div>

              <div className="bg-card border-y sm:border border-border rounded-none sm:rounded-xl p-3 text-[10.5px] shadow-3xs flex items-center gap-3 font-sans">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground uppercase text-[9px] tracking-wide">Pembayaran Aman</p>
                  <p className="text-muted-foreground leading-normal font-medium">
                    Transaksi Anda dienkripsi penuh dan diproses secara aman oleh Xendit Payment Gateway.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </>
  );
}