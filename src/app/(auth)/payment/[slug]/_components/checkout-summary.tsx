"use client";

import { useState, useEffect, useTransition } from "react";
import { validateCouponAction } from "@/actions/coupon";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type WebinarAddonData } from "@/types/webinar";

interface SummaryProps {
  webinarId: string;
  title: string;
  category: string;
  duration: string;
  basePrice: number;
  totalSessions: number;
  initialUser: { name: string | null; email: string; phone: string | null } | null;
  initialCoupon: string | null;
  addons: WebinarAddonData[]; // 🌟 BARU: Terima prop addon list
}

type PaymentMethod = "VIRTUAL_ACCOUNT" | "QRIS";

export default function CheckoutSummary({
  webinarId, title, category, duration, basePrice, totalSessions, initialUser, initialCoupon, addons = []
}: SummaryProps) {
  const [couponCode, setCouponCode] = useState(initialCoupon || "");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(initialCoupon);
  const [method, setMethod] = useState<PaymentMethod>("VIRTUAL_ACCOUNT");
  const [isPending, startTransition] = useTransition();

  // 🌟 STATE BARU: Menyimpan addon id yang dicentang
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const [guestForm, setGuestForm] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    phone: initialUser?.phone || ""
  });

  // 🌟 LOGIKA HARGA BARU
  const addonAmount = addons
    .filter(a => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const subTotal = basePrice + addonAmount;
  const finalPrice = Math.max(0, subTotal - discount); // Harga tak mungkin minus

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  useEffect(() => {
    if (initialCoupon) {
      startTransition(async () => {
        const res = await validateCouponAction({ code: initialCoupon, webinarId });
        if (res.success && res.discountAmount !== undefined) {
          setDiscount(res.discountAmount);
          toast.success(`Kupon aman terverifikasi server: ${initialCoupon}`);
        } else {
          setAppliedCoupon(null);
          setCouponCode("");
        }
      });
    }
  }, [initialCoupon, webinarId]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    startTransition(async () => {
      const res = await validateCouponAction({ code: couponCode, webinarId });
      // Pada realitasnya, server juga harus memvalidasi terhadap total belanja yang baru.
      if (res.success && res.discountAmount !== undefined) {
        setDiscount(res.discountAmount);
        setAppliedCoupon(couponCode.toUpperCase().trim());
        toast.success(res.message);
      } else {
        toast.error(res.message);
        setDiscount(0);
        setAppliedCoupon(null);
      }
    });
  };

  const handleCheckout = () => {
    if (!guestForm.name || !guestForm.email || !guestForm.phone) {
      toast.error("Mohon lengkapi formulir data diri Anda.");
      return;
    }
    // TODO: Kirim selectedAddonIds juga ke fungsi action payment (processSecurePaymentAction) 
  };

  return (
    <div className="grid grid-cols-1 gap-4 text-xs max-w-xl mx-auto antialiased">
      {/* 1. RINGKASAN DATA WEBINAR */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 space-y-2 shadow-2xs">
        <span className="text-[9px] font-semibold uppercase text-primary bg-accent px-2 py-0.5 rounded-md border border-border/10 w-fit">{category}</span>
        <h2 className="text-sm font-bold leading-snug text-foreground">{title}</h2>
        <p className="text-muted-foreground text-[10px] font-medium">⏳ {duration} | 📅 {totalSessions} Sesi Kelas</p>
      </div>

      {/* 🌟 2. KATALOG ADD-ONS (BARU) */}
      {addons.length > 0 && (
        <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-2xs">
          <p className="text-[9px] font-semibold uppercase text-muted-foreground tracking-wider">Layanan Tambahan (Opsional)</p>
          <div className="space-y-2">
            {addons.map((addon) => (
              <label key={addon.id} className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  checked={selectedAddonIds.includes(addon.id)}
                  onChange={() => handleToggleAddon(addon.id)}
                  disabled={isPending}
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-xs">{addon.name}</p>
                  {addon.description && <p className="text-[10px] text-muted-foreground">{addon.description}</p>}
                </div>
                <div className="font-semibold text-primary text-xs">
                  + Rp {addon.price.toLocaleString("id-ID")}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 3. FORM DATA PEMBELI */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-2xs">
        <p className="text-[9px] font-semibold uppercase text-muted-foreground tracking-wider">Informasi Data Pembeli</p>
        <div className="space-y-2">
          <input
            type="text" placeholder="Nama Lengkap Sesuai Sertifikat"
            value={guestForm.name} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
            disabled={isPending || !!initialUser}
            className="w-full px-3 py-2 border border-border bg-muted/20 rounded-lg focus:outline-hidden disabled:opacity-60 disabled:bg-muted/40 font-semibold "
          />
          <input
            type="email" placeholder="Alamat Email Aktif"
            value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
            disabled={isPending || !!initialUser}
            className="w-full px-3 py-2 border border-border bg-muted/20 rounded-lg focus:outline-hidden disabled:opacity-60 disabled:bg-muted/40 font-semibold "
          />
          <input
            type="tel" placeholder="Nomor WhatsApp Aktif"
            value={guestForm.phone} onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
            disabled={isPending || !!initialUser}
            className="w-full px-3 py-2 border border-border bg-muted/20 rounded-lg focus:outline-hidden disabled:opacity-60 disabled:bg-muted/40 font-semibold "
          />
        </div>
      </div>

      {/* 4. SELEKTOR SALURAN PEMBAYARAN */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 space-y-2.5 shadow-2xs">
        <p className="text-[9px] font-semibold uppercase text-muted-foreground tracking-wider">Metode Pembayaran</p>
        <div className="grid grid-cols-2 gap-2">
          {(["VIRTUAL_ACCOUNT", "QRIS"] as PaymentMethod[]).map((m) => (
            <button key={m} type="button" onClick={() => setMethod(m)} disabled={isPending} className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${method === m ? "border-primary bg-accent/20 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}>
              <p className="font-semibold text-foreground text-xs">{m === "VIRTUAL_ACCOUNT" ? "💳 Bank VA" : "📱 QRIS Scan"}</p>
              <p className="text-[9px] text-muted-foreground pt-0.5 font-medium">{m === "VIRTUAL_ACCOUNT" ? "Mandiri, BCA, BNI" : "OVO, Dana, LinkAja"}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 5. FORM VOUCHER PROMO & REKAP NOTA FINAL */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 space-y-4 shadow-2xs font-medium">
        <div className="flex gap-2">
          <input type="text" placeholder="KODE VOUCHER PROMO" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={isPending || !!initialCoupon} className="flex-1 px-3 py-1.5 border border-border bg-muted/30 rounded-lg uppercase font-semibold tracking-wider focus:outline-hidden disabled:opacity-60" />
          <button type="button" onClick={handleApplyCoupon} disabled={isPending || !couponCode.trim() || !!initialCoupon} className="px-4 bg-foreground text-background font-semibold rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-30">Gunakan</button>
        </div>

        <div className="space-y-1.5 text-foreground/80 border-t border-border/40 pt-3">
          <div className="flex justify-between"><span>Harga Dasar Webinar:</span><span>Rp {basePrice.toLocaleString("id-ID")}</span></div>

          {/* 🌟 Tampilkan rekap add-ons jika ada */}
          {addonAmount > 0 && (
            <div className="flex justify-between"><span>Total Layanan Tambahan:</span><span>Rp {addonAmount.toLocaleString("id-ID")}</span></div>
          )}

          {discount > 0 && <div className="flex justify-between text-primary font-bold"><span>Potongan Diskon ({appliedCoupon}):</span><span>- Rp {discount.toLocaleString("id-ID")}</span></div>}

          <div className="h-px bg-border my-1" />
          <div className="flex justify-between text-sm font-bold text-foreground pt-0.5">
            <span>Total Pembayaran:</span>
            <span className="text-primary">{finalPrice === 0 ? "GRATIS" : `Rp ${finalPrice.toLocaleString("id-ID")}`}</span>
          </div>
        </div>

        <button type="button" onClick={handleCheckout} disabled={isPending} className="w-full py-2.5 bg-primary text-primary-foreground font-bold uppercase rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50">
          {isPending ? <Loader2 size={12} className="animate-spin" /> :
            finalPrice === 0 ? "Konfirmasi & Daftar Gratis" : `Bayar via ${method === "VIRTUAL_ACCOUNT" ? "VA" : "QRIS"}`}
        </button>
      </div>
    </div>
  );
}