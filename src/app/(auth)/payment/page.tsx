// src/app/payment/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  CreditCard, QrCode, Clock,
  CheckCircle2, Copy, HelpCircle, FileText, AlertTriangle, Loader2, Building2, ChevronRight, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";


interface EnrollmentData {
  id: string;
  totalAmount: number;
  paymentChannel: string;
  paymentData: string | null;
  xenditReferenceId: string | null;
  expiresAt: string | null;
  webinar: {
    title: string;
  };
  user: {
    name: string;
    email: string;
  };
  selectedAddons: Array<{
    addon: {
      name: string;
    };
  }>;
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const enrollmentId = searchParams.get("id"); // Tangkap secure ID pendaftaran

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [countdownMinutes, setCountdownMinutes] = useState<number>(1440);


  const fetchInvoiceDetails = useCallback(async () => {
    if (!enrollmentId) {
      setApiError("invalidTxId");
      setLoading(false);
      return;
    }

    try {
      // Ambil detail data manifes invoice langsung berdasarkan ID transaksi dari DB internal
      const response = await fetch(`/api/enrollments/detail?id=${enrollmentId}`);
      const result = await response.json();

      if (response.ok) {
        setEnrollment(result.data);
        if (result.data.expiresAt) {
          const diffMs = new Date(result.data.expiresAt).getTime() - Date.now();
          setCountdownMinutes(Math.max(0, Math.floor(diffMs / 60000)));
        }
      } else {
        setApiError(result.error || "failedLoadInvoice");
      }
    } catch {
      setApiError("dbInterconnectError");
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  // Alur pendukung otomatis jika Anda ingin melempar user murni ke ekosistem Checkout Hosted Page milik Xendit
  useEffect(() => {
    if (!loading && enrollment?.paymentData?.startsWith("http")) {
      // Hapus komentar baris di bawah jika ingin langsung mengalihkan ke ekosistem Xendit Hosted Invoice page:
      // window.location.href = enrollment.paymentData;
    }
  }, [loading, enrollment]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>{"Menyiapkan Gerbang Pembayaran..."}</span>
      </div>
    );
  }

  if (apiError || !enrollment) {
    return (
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] flex flex-col items-center justify-center p-4 text-xs font-sans">
        <div className="max-w-md w-full bg-card border border-border p-5 rounded-xl space-y-4 shadow-3xs text-center">
          <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-foreground uppercase">{"Ada masalah dengan transaksi Anda? Hubungi Dukungan."}</h2>
            <p className="text-muted-foreground leading-normal">{apiError || "txDataNotFound"}</p>
          </div>
          <button onClick={() => router.push("/webinars")} className="w-full h-9 bg-primary text-primary-foreground font-semibold uppercase text-[10px] tracking-wider rounded-lg cursor-pointer">
            {"Kembali ke Katalog"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-foreground py-0 sm:py-8 px-0 sm:px-6 lg:px-8 antialiased text-xs font-sans">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* HEADER BREADCRUMB */}
        <div className="hidden sm:flex justify-between items-center border-b border-border/40 pb-4">
          <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
            <Building2 size={11} className="text-primary" />
            <span>{"Pusat Dukungan Perusahaan"}</span>
            <ChevronRight size={10} />
            <span className="text-foreground font-black">{"Pembayaran Aman"}</span>
          </div>
          <button onClick={() => router.push("/webinars")} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground border border-border/60 bg-card px-3 py-1.5 rounded-lg cursor-pointer">
            <ArrowLeft size={11} /> {"Batalkan Transaksi"}
          </button>
        </div>

        {/* METADATA SHEET DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">

          {/* PANEL KIRI: DETAIL RINGKASAN REKAP NOTA */}
          <div className="md:col-span-7 bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl shadow-3xs p-4 sm:p-6 md:p-8 space-y-5">
            <div className="border-b border-border/40 pb-4 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest uppercase">{"Tagihan Terenkripsi"}</span>
                <h1 className="text-base font-bold uppercase pt-1 tracking-tight">{enrollment.webinar.title}</h1>
                <p className="text-[10px] text-muted-foreground font-mono">REF: {enrollment.xenditReferenceId}</p>
              </div>
              <span className="inline-flex bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold text-[9px] tracking-wider shrink-0">{"Menunggu Pembayaran"}</span>
            </div>

            {/* Manifes User Akun */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/10 pb-0.5"><Building2 size={12} className="text-primary" /> {"Identitas Akun Tertaut"}</h3>
              <div className="bg-muted/10 p-3 rounded-xl border border-border/30 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-muted-foreground font-medium">{"Nama Lengkap"}</p>
                  <p className="font-semibold text-foreground">{enrollment.user.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">{"Alamat Email"}</p>
                  <p className="font-semibold text-foreground truncate">{enrollment.user.email}</p>
                </div>
              </div>
            </div>

            {/* Rincian Komponen Komersial */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/10 pb-0.5"><FileText size={12} className="text-primary" /> {"Rincian Instrumen Akses"}</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center p-2.5 bg-muted/10 border border-border/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{"Akses Utama Webinar"}</span>
                  </div>
                  <span className="font-bold text-foreground">{"Terkunci"}</span>
                </div>
                {enrollment.selectedAddons.length > 0 && enrollment.selectedAddons.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-muted/10 border border-border/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span className="font-medium text-muted-foreground">{"Dokumen Pendukung Tambahan"} <strong className="text-foreground uppercase text-[10px]">{item.addon.name}</strong></span>
                    </div>
                    <span className="font-semibold text-foreground">{"Aman"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Finansial Akuntansi */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{"Total Pembayaran"}</p>
                <p className="text-lg font-bold text-primary tracking-tight">
                  {formatCurrency(enrollment.totalAmount)}
                </p>
              </div>
              <div className="text-right text-[10px] text-muted-foreground font-mono space-y-0.5">
                <p className="flex items-center gap-1 justify-end"><Clock size={11} className="text-primary" /> Batas Waktu Pembayaran</p>
                <p className="font-semibold text-foreground text-[11px]">{`${Math.floor(countdownMinutes / 60)} Jam ${countdownMinutes % 60} Menit`}</p>
              </div>
            </div>
          </div>

          {/* PANEL KANAN: KODE BAYAR / INSTRUKSI GATEWAY XENDIT API V4 */}
          <div className="md:col-span-5 bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl p-4 sm:p-5 space-y-4 shadow-3xs w-full">
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
              {enrollment.paymentChannel === "QRIS" ? <QrCode size={13} className="text-primary" /> : <CreditCard size={13} className="text-primary" />}
              Instruksi Pembayaran
            </h3>

            {/* RENDER KONDISIONAL METODE 1: QRIS DATA */}
            {enrollment.paymentChannel === "QRIS" ? (
              <div className="space-y-3 text-center">
                <div className="w-40 h-44 bg-white border border-border/60 rounded-xl p-2 mx-auto flex items-center justify-center shadow-inner relative group">
                  {enrollment.paymentData ? (
                    /* Render kode QR dinamis asli bersumber dari API Invoice Xendit */
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x160&data=${encodeURIComponent(enrollment.paymentData)}`}
                      alt="Secure QRIS Payment Stream" className="w-full h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <span className="text-muted-foreground/40 font-mono text-[9px] animate-pulse">GENERATING_QR_STREAM...</span>
                  )}
                </div>
                <div className="space-y-1.5 text-left text-[11px] font-sans leading-relaxed">
                  <p className="font-semibold text-foreground flex items-center gap-1"><HelpCircle size={12} className="text-primary" /> Cara Membayar dengan QRIS</p>
                  <ol className="list-decimal pl-4 text-muted-foreground space-y-1">
                    <li>Buka aplikasi mobile banking atau e-wallet (GoPay, OVO, Dana, dll).</li>
                    <li>Pilih menu 'Scan QR' atau 'Bayar'.</li>
                    <li>Arahkan kamera ke kode QR di atas dan konfirmasi nominal pembayaran.</li>
                  </ol>
                </div>
              </div>
            ) : (
              /* RENDER KONDISIONAL METODE 2: VIRTUAL ACCOUNT DATA */
              <div className="space-y-4 font-sans">
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-center space-y-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Nomor Virtual Account</p>
                  <div className="flex items-center justify-center gap-2 bg-background border px-3 py-1.5 rounded-lg w-fit mx-auto shadow-3xs">
                    <span className="font-mono text-sm font-bold text-foreground tracking-widest">{enrollment.paymentData || "MEMUAT KODE VA..."}</span>
                    <button onClick={() => handleCopyCode(enrollment.paymentData || "")} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded hover:bg-muted transition-colors">
                      <Copy size={12} className={isCopied ? "text-emerald-500" : ""} />
                    </button>
                  </div>
                  {isCopied && <p className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">Nomor berhasil disalin!</p>}
                </div>
                <div className="space-y-1.5 text-left text-[11px] font-sans leading-relaxed">
                  <p className="font-semibold text-foreground flex items-center gap-1"><HelpCircle size={12} className="text-primary" /> Cara Membayar via Virtual Account</p>
                  <ol className="list-decimal pl-4 text-muted-foreground space-y-1">
                    <li>Masuk ke aplikasi mobile banking Anda.</li>
                    <li>Pilih menu 'Transfer' lalu pilih 'Virtual Account'.</li>
                    <li>Masukkan nomor VA di atas dan selesaikan transaksi.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* SYNC ACTIONS FOOTER BUTTON */}
            <div className="pt-2 border-t border-border/40 space-y-2">
              <button
                onClick={async () => {
                  try {
                    const check = await fetch(`/api/enrollments/status-check?id=${enrollment.id}`);
                    const statusData = await check.json();
                    if (statusData.status === "SETTLED" || statusData.status === "PAID") {
                      toast.success("Pembayaran terverifikasi. Mengalihkan ke dashboard...");
                      setTimeout(() => router.push("/"), 1500);
                    } else {
                      toast.info("Pembayaran Anda masih menunggu konfirmasi sistem.");
                    }
                  } catch {
                    toast.info("Sistem sedang memantau pembaruan status transaksi Anda di latar belakang.");
                  }
                }}
                className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Cek Status Pembayaran
              </button>
              <Link
                href="/"
                className="w-full h-8 border border-border bg-background text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider text-[9px] rounded-lg flex items-center justify-center gap-1.5"
              >
                {"Kembali ke Dasbor Utama"}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>{"Menyiapkan Gerbang Pembayaran..."}</span>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}