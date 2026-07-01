// src/app/(public)/checkout/checkout-order-panel.tsx
"use client";

import {
  Loader2, Layers, Award, VideoIcon, FileText, Ticket,
  CreditCard, QrCode, ShoppingCart, CheckCircle2, Clock,
  Users, ShieldCheck, Zap, Tag,
} from "lucide-react";


interface WebinarAddonData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
}

interface WebinarData {
  id: string;
  title: string;
  basePrice: number;
  duration: string;
  addons?: WebinarAddonData[];
  _count: { enrollments: number };
}

interface CurrentUser {
  name?: string | null;
  email?: string | null;
}

interface CheckoutOrderPanelProps {
  webinar: WebinarData;
  currentUser: CurrentUser | undefined;
  selectedAddons: string[];
  toggleAddon: (id: string) => void;
  couponCode: string;
  setCouponCode: (v: string) => void;
  discountAmount: number;
  isApplyingCoupon: boolean;
  couponError: string | null;
  appliedCoupon: string | null;
  handleApplyCoupon: () => void;
  paymentMethod: "VIRTUAL_ACCOUNT" | "QRIS";
  setPaymentMethod: (v: "VIRTUAL_ACCOUNT" | "QRIS") => void;
  finalTotalInvoice: number;
  formatCurrency: (n: number) => string;
  isSubmitting: boolean;
  handleLoggedInCheckout: () => void;
}

function AddonCard({
  addon,
  isChecked,
  onToggle,
}: {
  addon: WebinarAddonData;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const nameLower = addon.name.toLowerCase();
  const isCert = nameLower.includes("sertifikat") || nameLower.includes("cert");
  const isVideo = nameLower.includes("video") || nameLower.includes("rekaman") || nameLower.includes("playback");

  const iconEl = isCert ? (
    <Award size={14} className="text-emerald-500 shrink-0" />
  ) : isVideo ? (
    <VideoIcon size={14} className="text-indigo-500 shrink-0" />
  ) : (
    <FileText size={14} className="text-amber-500 shrink-0" />
  );

  return (
    <div
      onClick={onToggle}
      className={`group p-3 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all duration-200
        ${isChecked
          ? "border-primary/60 bg-primary/5 shadow-xs shadow-primary/10"
          : "border-border/60 bg-muted/10 hover:bg-muted/30 hover:border-border"
        }`}
    >
      {/* Custom checkbox */}
      <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200
        ${isChecked ? "bg-primary border-primary" : "border-muted-foreground/30 bg-card group-hover:border-muted-foreground/60"}`}
      >
        {isChecked && <CheckCircle2 size={10} className="text-primary-foreground stroke-[3]" />}
      </div>

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {iconEl}
        <span className="text-[11px] font-semibold  text-foreground leading-tight truncate">
          {addon.name}
        </span>
      </div>

      <span className={`text-[11px] font-bold shrink-0 tabular-nums transition-colors duration-200
        ${isChecked ? "text-primary" : "text-foreground"}`}
      >
        +{addon.price === 0 ? "FREE" : addon.price.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}

function PaymentCard({
  label,
  sub,
  icon: Icon,
  isActive,
  onSelect,
}: {
  label: string;
  sub: string;
  icon: React.ElementType;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all duration-200
        ${isActive
          ? "border-primary/60 bg-primary/5 shadow-xs shadow-primary/10"
          : "border-border/60 hover:bg-muted/20 hover:border-border"
        }`}
    >
      <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isActive ? "bg-primary/15" : "bg-muted/50"}`}>
        <Icon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`text-[10.5px] font-semibold leading-none ${isActive ? "text-foreground" : "text-foreground/80"}`}>
          {label}
        </span>
        <span className="text-[9px] text-muted-foreground mt-0.5">{sub}</span>
      </div>
      {isActive && (
        <div className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </div>
  );
}

export function CheckoutOrderPanel({
  webinar,
  currentUser,
  selectedAddons,
  toggleAddon,
  couponCode,
  setCouponCode,
  discountAmount,
  isApplyingCoupon,
  couponError,
  appliedCoupon,
  handleApplyCoupon,
  paymentMethod,
  setPaymentMethod,
  finalTotalInvoice,
  formatCurrency,
  isSubmitting,
  handleLoggedInCheckout,
}: CheckoutOrderPanelProps) {

  const activeAddons = webinar.addons?.filter((a) => a.isActive) ?? [];
  const selectedAddonsList = webinar.addons?.filter((a) => selectedAddons.includes(a.id)) ?? [];

  return (
    <div className="space-y-4">

      {/* Main configurator card */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-5">

        {/* ── Add-ons ── */}
        {activeAddons.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Layers size={12} className="text-primary" />
              {"Pilih Akses Tambahan"}
            </h3>
            <div className="space-y-2">
              {activeAddons.map((addon) => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  isChecked={selectedAddons.includes(addon.id)}
                  onToggle={() => toggleAddon(addon.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Coupon ── */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={12} className="text-primary" />
            {"Gunakan Kode Promo"}
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={"Masukkan kode diskon di sini"}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
                className="w-full h-9 pl-7 pr-3 rounded-lg border border-border/60 bg-card font-mono font-semibold text-foreground text-[11px]
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground/50
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-150"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={!!appliedCoupon || isApplyingCoupon || !couponCode.trim()}
              className="h-9 px-4 bg-foreground text-background dark:bg-white dark:text-black font-bold uppercase text-[10px] rounded-lg
                transition-all duration-200 hover:opacity-85 active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              {isApplyingCoupon ? (
                <Loader2 size={11} className="animate-spin" />
              ) : appliedCoupon ? (
                "couponAppliedLabel"
              ) : (
                "applyCouponBtn"
              )}
            </button>
          </div>
          {couponError && (
            <p className="text-[10px] font-semibold  text-rose-500 flex items-center gap-1">
              ⚠ {couponError}
            </p>
          )}
          {appliedCoupon && (
            <p className="text-[10px] font-semibold  text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={10} />
              {"Promo berhasil diterapkan!"} {formatCurrency(discountAmount)}
            </p>
          )}
        </div>

        {/* ── Payment Method (only if amount > 0) ── */}
        {finalTotalInvoice > 0 && (
          <div className="space-y-2.5 pt-1 border-t border-border/40">
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={12} className="text-primary" />
              {"Metode Pembayaran"}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <PaymentCard
                label={"QRIS / E-Wallet"}
                sub={"Proses Otomatis"}
                icon={QrCode}
                isActive={paymentMethod === "QRIS"}
                onSelect={() => setPaymentMethod("QRIS")}
              />
            </div>
          </div>
        )}

        {/* ── Price Summary ── */}
        <div className="rounded-xl bg-muted/30 border border-border/40 p-4 space-y-2 text-[11px]">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="font-medium">{"Akses Dasar Webinar"}</span>
            <span className="font-semibold text-foreground tabular-nums">
              {webinar.basePrice === 0 ? (
                <span className="text-emerald-500 font-black">{"Gratis"}</span>
              ) : (
                formatCurrency(webinar.basePrice)
              )}
            </span>
          </div>

          {selectedAddonsList.map((addon) => (
            <div key={addon.id} className="flex justify-between items-center text-muted-foreground/80">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={10} className="text-primary" />
                <span className="truncate max-w-[150px]">{addon.name}</span>
              </span>
              <span className="font-medium text-foreground/90 tabular-nums shrink-0">
                +{formatCurrency(addon.price)}
              </span>
            </div>
          ))}

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-rose-500 font-medium">
              <span className="flex items-center gap-1">
                <Tag size={10} />
                {"Potongan Harga Promo"}
              </span>
              <span className="tabular-nums">-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-border/50 flex justify-between items-center">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
              <ShoppingCart size={12} className="text-primary" />
              {"Total Biaya"}
            </span>
            <span className="text-base font-bold text-primary tracking-tight tabular-nums">
              {finalTotalInvoice === 0 ? (
                <span className="text-emerald-500">{"Gratis"}</span>
              ) : (
                formatCurrency(finalTotalInvoice)
              )}
            </span>
          </div>
        </div>

        {/* ── CTA Button ── */}
        {currentUser ? (
          <button
            onClick={handleLoggedInCheckout}
            disabled={isSubmitting}
            className="w-full h-11 relative overflow-hidden rounded-xl font-bold uppercase tracking-widest text-[10.5px]
              bg-primary text-primary-foreground
              hover:opacity-90 active:scale-[0.99]
              flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 cursor-pointer
              shadow-md shadow-primary/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {"Memproses Pendaftaran..."}
              </>
            ) : finalTotalInvoice === 0 ? (
              <>
                <Zap size={13} />
                {"Klaim Akses Gratis"}
              </>
            ) : (
              <>
                <CreditCard size={13} />
                {"Konfirmasi & Lanjutkan Pembayaran"}
              </>
            )}
          </button>
        ) : (
          <div className="text-center p-3 rounded-xl bg-muted/40 border border-border/30 text-[10px] text-muted-foreground font-medium">
            {"Lengkapi profil untuk melanjutkan."}
          </div>
        )}
      </div>

      {/* ── Metadata Side Log ── */}
      <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-1.5 text-[10.5px] shadow-sm">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <Clock size={11} className="text-primary/70" />
            {"Durasi Program"}
          </span>
          <span className="font-semibold text-foreground">{webinar.duration}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <Users size={11} className="text-primary/70" />
            {"Delegasi Terdaftar"}
          </span>
          <span className="font-semibold text-foreground">{webinar._count?.enrollments ?? 0} {"Profesional"}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <ShieldCheck size={11} className="text-primary/70" />
            {"Akreditasi"}
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[9px] uppercase tracking-widest">
            {"Disetujui Standar Industri"}
          </span>
        </div>
      </div>
    </div>
  );
}
