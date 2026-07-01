import { getOrderCreationContext, clearStaleOrder, createOrderWithPayment } from "./order.repository";
import { createXenditQRIS } from "@/services/payment.service"; // Kita akan pindahkan ini ke payment module nanti
import { sendUniversalEmail } from "@/services/email.service";
import { RegistrationSuccessTemplate } from "@/components/emails/registration-success-template";
import { OrderStatus } from "@/generated/prisma/client";

interface OrderRequest {
  webinarId: string;
  addons: string[];
  totalAmount: number;
  paymentChannel: string;
  userEmail: string;
}

/**
 * 🚀 HIGH PERFORMANCE SERVICE LAYER
 */
export async function processNewOrder(req: OrderRequest) {
  // 1. Ambil semua konteks dalam SATU kali round-trip database
  const { webinar, user } = await getOrderCreationContext(req.webinarId, req.userEmail);

  if (!webinar) throw new Error("Program masterclass tidak ditemukan.");
  if (!user || !user.email) throw new Error("Profil akun tidak valid.");
  
  const customerPhone = user.profile?.whatsapp;
  if (!customerPhone || customerPhone.trim() === "") {
    throw new Error("Nomor WhatsApp/Telepon aktif tidak ditemukan pada profil Anda.");
  }

  // 2. O(1) Lookup & Validation untuk Idempotency
  const existingOrder = user.orders[0];
  if (existingOrder) {
    if (existingOrder.status === OrderStatus.SUCCESS) {
      throw new Error("Anda sudah terdaftar aktif di program masterclass ini.");
    }
    // Hapus order menggantung tanpa menunggu (fire and forget jika memungkinkan, tapi amannya di-await)
    await clearStaleOrder(existingOrder.id);
  }

  // 3. Kalkulasi Harga O(n) yang sangat cepat menggunakan Set untuk lookup O(1)
  const requestedAddonSet = new Set(req.addons);
  let addonAmount = 0;
  const validAddons: { addonId: string; priceAtPurchase: number }[] = [];

  for (const addon of webinar.addons) {
    if (requestedAddonSet.has(addon.id)) {
      addonAmount += addon.price;
      validAddons.push({ addonId: addon.id, priceAtPurchase: addon.price });
    }
  }

  const baseAmount = webinar.basePrice;
  const serverCalculatedTotal = Math.max(0, baseAmount + addonAmount);

  if (req.paymentChannel !== "FREE_CHANNELS" && req.totalAmount !== serverCalculatedTotal) {
    throw new Error("Integritas nominal transaksi tidak valid (Mismatch).");
  }

  const isFree = serverCalculatedTotal === 0;
  const generatedReferenceId = `INV-GEO-${user.id.substring(0, 4).toUpperCase()}-${Date.now()}`;
  
  let xenditPaymentData: string | null = null;
  let xenditExpiryDate: Date | null = null;

  // 4. Hit External Gateway (XENDIT)
  if (!isFree) {
    const qrisResult = await createXenditQRIS({
      orderId: generatedReferenceId,
      amount: serverCalculatedTotal,
      expiryMinutes: 60,
      recipientName: user.name || "Enterprise Member",
      recipientPhone: customerPhone,
      customerEmail: user.email
    });
    xenditPaymentData = qrisResult.qrString;
    xenditExpiryDate = new Date(qrisResult.expiresAt);
  }

  // 5. Atomic Transaction
  const newOrder = await createOrderWithPayment({
    userId: user.id,
    webinarId: req.webinarId,
    baseAmount,
    addonAmount,
    totalAmount: serverCalculatedTotal,
    selectedAddons: validAddons,
    isFree,
    xenditReferenceId: generatedReferenceId,
    xenditPaymentData,
    xenditExpiryDate
  });

  // 6. Asynchronous Notification (Tidak memblokir HTTP response!)
  if (isFree) {
    const startDateStr = webinar.sessions.length > 0 
      ? new Date(webinar.sessions[0].startDate).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        }) + " WIB"
      : "Jadwal Menyusul";
      
    // Fire and forget
    sendUniversalEmail({
      toEmail: user.email,
      subject: `Pendaftaran Berhasil: ${webinar.title}`,
      template: RegistrationSuccessTemplate({
        userName: user.name || "Peserta",
        webinarTitle: webinar.title,
        startDate: startDateStr,
        loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/profile`
      })
    }).catch(err => console.error("Email error:", err));
  }

  return {
    orderId: newOrder.id,
    status: newOrder.status,
    xenditReferenceId: generatedReferenceId,
    paymentData: xenditPaymentData,
    expiresAt: xenditExpiryDate
  };
}
