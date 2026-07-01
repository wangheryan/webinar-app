"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";

export interface CouponResult {
  success: boolean;
  message: string;
  discountAmount?: number;
  finalAmount?: number;
  couponId?: string;
}

interface ValidateCouponPayload {
  code: string;
  webinarId: string;
  addonIds?: string[]; // 🌟 BARU: Menerima Add-on agar SubTotal valid
}

export async function validateCouponAction(payload: ValidateCouponPayload): Promise<CouponResult> {
  try {
    const { code, webinarId, addonIds = [] } = payload;
    
    // Ambil sesi user (Tidak diblokir jika kosong agar Guest Mode tetap bisa cek harga diskon)
    const session = await getServerSession(authConfig);
    const userId = session?.user?.id;

    // 🌟 PERBAIKAN: Sertakan relasi addons untuk kalkulasi SubTotal
    const [webinar, coupon] = await Promise.all([
      prisma.webinar.findUnique({ 
        where: { id: webinarId },
        include: { addons: true }
      }),
      prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } }),
    ]);

    if (!webinar) return { success: false, message: "Program kelas tidak ditemukan." };
    if (!coupon || !coupon.isActive) return { success: false, message: "Voucher diskon tidak valid." };

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) return { success: false, message: "Masa berlaku voucher telah habis." };
    if (coupon.qtyAvailable <= 0) return { success: false, message: "Kuota voucher sudah habis digunakan." };

    // 🌟 KALKULASI SUBTOTAL BARU (Base Price + Add-ons)
    const baseAmount = webinar.basePrice;
    const selectedAddons = webinar.addons.filter((a) => addonIds.includes(a.id) && a.isActive);
    const addonAmount = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const subTotal = baseAmount + addonAmount;

    // Validasi syarat pembelian minimal menggunakan SubTotal
    if (subTotal < coupon.minPurchase) {
      return { 
        success: false, 
        message: `Minimal nilai transaksi Rp ${coupon.minPurchase.toLocaleString("id-ID")} tidak terpenuhi.` 
      };
    }

    // Jika user sudah login, pastikan dia belum pernah pakai kupon ini untuk webinar yang sama
    // (Untuk Guest, validasi ini akan dieksekusi secara ketat di action payment saat akunnya di-generate)
    if (userId) {
      const usage = await prisma.couponUsage.findUnique({
        where: { userId_webinarId_couponId: { userId, webinarId, couponId: coupon.id } },
      });
      if (usage) return { success: false, message: "Kupon ini sudah pernah Anda gunakan untuk program ini." };
    }

    // 🌟 PERBAIKAN: Kalkulasi persentase dihitung dari SubTotal keranjang, bukan harga dasar
    let discountAmount = coupon.type === "FIXED_AMOUNT" 
      ? coupon.value 
      : Math.round((subTotal * coupon.value) / 100);
    
    // Potong diskon jika melebihi batas maksimal potongan
    if (coupon.type === "PERCENTAGE" && coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
    
    // Diskon tidak boleh membuat harga menjadi minus (Maksimal diskon = SubTotal)
    if (discountAmount > subTotal) {
      discountAmount = subTotal;
    }

    return {
      success: true,
      message: "Voucher diskon berhasil diterapkan.",
      discountAmount,
      finalAmount: subTotal - discountAmount,
      couponId: coupon.id,
    };
  } catch (error) {
    console.error("❌ Validasi Kupon Error:", error);
    return { success: false, message: "Gagal memproses otorisasi voucher dari server." };
  }
}