"use client";

import { useState, useEffect, useTransition } from "react";
import { validateCouponAction } from "@/actions/coupon";
import { ShieldCheck, UserCheck, UserPlus, Loader2, QrCode, CreditCard, Ticket, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type PaymentMethod = "VIRTUAL_ACCOUNT" | "QRIS";

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface CheckoutManagerProps {
  webinar: {
    id: string;
    title: string;
    category: string;
    duration: string;
    basePrice: number;
    addons: Addon[];
  };
  totalSessions: number;
  initialUser: { name: string | null; email: string; phone: string } | null;
  initialCoupon: string | null;
  initialAddons: string[]; // 🌟 BARU: Menerima array Add-on dari halaman sebelumnya
}

export default function CheckoutFormManager({ webinar, totalSessions, initialUser, initialCoupon, initialAddons = [] }: CheckoutManagerProps) {
  // 🌟 KALKULASI HARGA AWAL (Base + Addons)
  const basePrice = webinar.basePrice;
  const selectedAddonsData = webinar.addons.filter(a => initialAddons.includes(a.id));
  const addonTotal = selectedAddonsData.reduce((sum, a) => sum + a.price, 0);
  const subTotal = basePrice + addonTotal;

  const [couponCode, setCouponCode] = useState(initialCoupon || "");
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(subTotal);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(initialCoupon);
  const [method, setMethod] = useState<PaymentMethod>("VIRTUAL_ACCOUNT");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [guestForm, setGuestForm] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    phone: initialUser?.phone || ""
  });

  // Fungsi utilitas untuk memvalidasi kupon dan menghitung total harga
  const handleValidateCoupon = async (code: string, isInitial = false) => {
    // Asumsi validateCouponAction bisa menerima payload subTotal atau menghitungnya secara internal di server
    // Di sini kita gunakan nilai pengembalian diskon untuk kalkulasi keamanan ganda di frontend
    const res = await validateCouponAction({ code, webinarId: webinar.id, addonIds: initialAddons });

    if (res.success && res.discountAmount !== undefined) {
      const newDiscount = res.discountAmount;
      const newFinalPrice = Math.max(0, subTotal - newDiscount); // Cegah minus

      setDiscount(newDiscount);
      setFinalPrice(newFinalPrice);
      setAppliedCoupon(code.toUpperCase().trim());

      if (!isInitial) toast.success(res.message || `Voucher diterapkan: ${code}`);
    } else {
      if (!isInitial) toast.error(res.message || "Voucher tidak valid.");
      setDiscount(0);
      setFinalPrice(subTotal);
      setAppliedCoupon(null);
      if (isInitial) setCouponCode("");
    }
  };

  useEffect(() => {
    if (initialCoupon) {
      startTransition(async () => {
        await handleValidateCoupon(initialCoupon, true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCoupon, webinar.id]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    startTransition(async () => {
      await handleValidateCoupon(couponCode, false);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialUser && (!guestForm.name || !guestForm.email || !guestForm.phone)) {
      toast.error("Mohon lengkapi seluruh manifes formulir identitas Anda.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/enrollments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webinarId: webinar.id,
            addons: initialAddons,
            totalAmount: finalPrice,
            paymentChannel: finalPrice === 0 ? "FREE_CHANNELS" : method,
            isGuest: !initialUser,
            customerDetails: !initialUser ? guestForm : undefined
          })
        });
        const result = await response.json();
        if (!response.ok) {
          toast.error(result.error || "Gagal memproses pendaftaran.");
          return;
        }
        if (finalPrice === 0) {
          toast.success("Pendaftaran Masterclass Berhasil!");
          router.push("/profile");
        } else {
          router.push(`/payment?id=${result.enrollmentId}`);
        }
      } catch {
        toast.error("Terjadi gangguan komunikasi saat membuat transaksi.");
      }
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-background text-foreground antialiased text-xs">

      {/* ── SEKSI KIRI: MANIFES IDENTITAS & METODE (lg:col-span-7) ── */}
      <div className="lg:col-span-7 space-y-5">

        {/* 1. KARTU OTENTIKASI / DATA DIRI */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-5 shadow-xs transition-all duration-200">
          {initialUser ? (
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
                <UserCheck size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-foreground text-sm leading-tight">Akun Terautentikasi</p>
                <p className="text-muted-foreground font-medium pt-0.5">
                  Sistem otomatis mengunci manifes pendaftaran untuk <span className="text-emerald-600 font-semibold underline">{guestForm.name}</span> ({guestForm.email}).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
                    <UserPlus size={14} />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">Manifes Data Peserta</h3>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">Guest Mode</span>
              </div>

              <p className="text-muted-foreground font-medium leading-relaxed">
                Sudah memiliki akun Geomining? <Link href="/auth/login" className="text-primary font-semibold hover:underline">Masuk Akun</Link> untuk sinkronisasi otomatis, atau isi data instan di bawah ini:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Nama Lengkap (Untuk Sertifikat)</label>
                  <input
                    type="text" placeholder="Nama Lengkap & Gelar" required
                    value={guestForm.name} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                    disabled={isPending} className="w-full px-3 py-2.5 border border-border bg-muted/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold  transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Alamat Email Aktif</label>
                  <input
                    type="email" placeholder="nama@email.com" required
                    value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    disabled={isPending} className="w-full px-3 py-2.5 border border-border bg-muted/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold  transition"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel" placeholder="Contoh: 081234567890" required
                    value={guestForm.phone} onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                    disabled={isPending} className="w-full px-3 py-2.5 border border-border bg-muted/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold  transition"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. KARTU METODE PEMBAYARAN PREMIUM (Hanya tampil jika harga > 0) */}
        {finalPrice > 0 ? (
          <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                <CreditCard size={14} />
              </div>
              <h3 className="font-bold text-sm tracking-tight">Metode Pembayaran Resmi</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* OPSI 1: VIRTUAL ACCOUNT */}
              <button
                type="button"
                onClick={() => setMethod("VIRTUAL_ACCOUNT")}
                disabled={isPending}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative overflow-hidden group disabled:opacity-50 ${method === "VIRTUAL_ACCOUNT"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                  : "border-border bg-muted/20 hover:bg-muted/50 hover:border-border-hover"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`p-2 rounded-lg transition-colors ${method === "VIRTUAL_ACCOUNT" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <CreditCard size={14} />
                  </span>
                  {method === "VIRTUAL_ACCOUNT" && <CheckCircle2 size={14} className="text-primary animate-scaleIn" />}
                </div>
                <div className="pt-4 space-y-0.5">
                  <p className="font-bold text-foreground text-xs">Bank Virtual Account</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">Transfer instan via Bank Mandiri, BCA, BNI, BRI, & Permata</p>
                </div>
              </button>

              {/* OPSI 2: QRIS */}
              <button
                type="button"
                onClick={() => setMethod("QRIS")}
                disabled={isPending}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative overflow-hidden group disabled:opacity-50 ${method === "QRIS"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                  : "border-border bg-muted/20 hover:bg-muted/50 hover:border-border-hover"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`p-2 rounded-lg transition-colors ${method === "QRIS" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <QrCode size={14} />
                  </span>
                  {method === "QRIS" && <CheckCircle2 size={14} className="text-primary animate-scaleIn" />}
                </div>
                <div className="pt-4 space-y-0.5">
                  <p className="font-bold text-foreground text-xs">QRIS Kode Interaktif</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">Pindai cepat via GoPay, ShopeePay, OVO, Dana, LinkAja, & m-Banking</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <Sparkles size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-emerald-800 dark:text-emerald-400">Akses Pembayaran Bebas Biaya</h3>
              <p className="text-[10px] font-medium opacity-90">Total tagihan Anda Rp 0. Tidak ada pemilihan metode pembayaran yang diperlukan. Anda bisa langsung memproses pendaftaran.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── SEKSI KANAN: RINGKASAN & SUBMIT (lg:col-span-5) ── */}
      <div className="lg:col-span-5 space-y-4">

        {/* KARTU RINGKASAN BIAYA & SUBMIT */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-5 shadow-xs space-y-5 sticky top-24">

          {/* Detail Ringkasan Program */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md w-fit block">
              {webinar.category}
            </span>
            <div className="space-y-1">
              <h2 className="text-sm font-bold leading-snug text-foreground tracking-tight line-clamp-3">{webinar.title}</h2>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium pt-0.5">
                <span>⏱️ {webinar.duration}</span>
                <span className="h-1 w-1 bg-border rounded-full" />
                <span>📂 {totalSessions} Sesi Terjadwal</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Form Input Voucher Subsidi */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Ticket size={12} />
              <span>Kode Voucher / Kupon Subsidi</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text" placeholder="MASUKKAN KODE PROMO"
                value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                disabled={isPending || !!initialCoupon}
                className="flex-1 px-3 py-2 border border-border bg-muted/40 rounded-xl uppercase font-bold tracking-wider focus:outline-none focus:border-primary transition disabled:opacity-60 text-center"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isPending || !couponCode.trim() || !!initialCoupon}
                className="px-4 bg-foreground text-background font-bold rounded-xl cursor-pointer hover:opacity-90 active:scale-[0.97] transition disabled:opacity-30 disabled:pointer-events-none"
              >
                Klaim
              </button>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Rincian Finansial Rekap */}
          <div className="space-y-2 font-semibold  text-muted-foreground text-[11px]">
            <div className="flex justify-between items-center">
              <span>Investasi Dasar Kelas</span>
              <span className="text-foreground">Rp {basePrice.toLocaleString("id-ID")}</span>
            </div>

            {/* 🌟 Rekap Add-ons */}
            {selectedAddonsData.length > 0 && (
              <div className="pt-1 pb-1 space-y-1.5">
                {selectedAddonsData.map(a => (
                  <div key={a.id} className="flex justify-between items-center text-[10px]">
                    <span className="truncate pr-4 flex items-center gap-1.5"><CheckCircle2 size={10} className="text-primary" /> {a.name}</span>
                    <span className="text-foreground">+Rp {a.price.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between items-center text-primary font-semibold bg-primary/5 p-2 rounded-xl border border-primary/10 mt-1">
                <span className="flex items-center gap-1">🎉 Potongan Voucher ({appliedCoupon})</span>
                <span>- Rp {discount.toLocaleString("id-ID")}</span>
              </div>
            )}

            {/* Tampilkan Metode Jika Tidak Gratis */}
            {finalPrice > 0 && (
              <div className="flex justify-between items-center text-[10px] mt-1 pt-1 border-t border-border/40">
                <span>Kanal Terpilih</span>
                <span className="text-foreground font-bold">{method === "VIRTUAL_ACCOUNT" ? "Transfer VA Bank" : "QRIS Scan"}</span>
              </div>
            )}

            <div className="h-px bg-border/50 pt-1" />

            <div className="flex justify-between items-baseline text-foreground pt-1">
              <span className="text-xs font-black">Total Tagihan</span>
              <span className={`text-lg font-bold tracking-tight ${finalPrice === 0 ? "text-emerald-500" : "text-primary"}`}>
                {finalPrice === 0 ? "GRATIS" : `Rp ${finalPrice.toLocaleString("id-ID")}`}
              </span>
            </div>
          </div>

          {/* Tombol Pay Trigger Submit Final */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 text-primary-foreground font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md ${finalPrice === 0 ? "bg-emerald-600 hover:bg-emerald-500" : "bg-primary hover:bg-primary/90"}`}
          >
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>{finalPrice === 0 ? "Selesaikan Pendaftaran" : `Bayar Sekarang via ${method === "VIRTUAL_ACCOUNT" ? "VA" : "QRIS"}`}</span>
              </>
            )}
          </button>

          <p className="text-[9px] text-center text-muted-foreground font-medium leading-normal px-2">
            Dengan menekan tombol di atas, Anda menyetujui seluruh regulasi administrasi serta hak akses materi Geomining.ID secara penuh.
          </p>
        </div>

      </div>
    </form>
  );
}