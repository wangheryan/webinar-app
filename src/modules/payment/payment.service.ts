import prisma from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@/generated/prisma/client";
import { sendUniversalEmail } from "@/services/email/email.service";
import { RegistrationSuccessTemplate } from "@/components/emails/registration-success-template";

/**
 * 🚀 HIGH PERFORMANCE PAYMENT SERVICE
 * Mengurus callback/webhook dan rekonsiliasi data pembayaran.
 */

export async function processXenditWebhook(externalId: string, status: string) {
  // 1. Cek idempotency: Hanya proses jika status berhasil
  if (status !== "SUCCEEDED" && status !== "COMPLETED") {
    return { success: true, ignored: true };
  }

  // 2. Gunakan single transaction untuk update Payment dan Order sekaligus
  // Hal ini menjamin konsistensi data
  const payment = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { xenditExternalId: externalId },
      data: { 
        status: PaymentStatus.PAID,
        paidAt: new Date()
      },
      include: {
        order: {
          include: {
            user: { select: { email: true, name: true } },
            webinar: {
              select: {
                title: true,
                sessions: { orderBy: { startDate: "asc" }, take: 1, select: { startDate: true } }
              }
            }
          }
        }
      }
    });

    // Perbarui status Order menjadi SUCCESS
    await tx.order.update({
      where: { id: updatedPayment.orderId },
      data: { status: OrderStatus.SUCCESS }
    });

    return updatedPayment;
  });

  // 3. Asynchronous Notification (Fire and forget)
  const order = payment.order;
  if (order.user.email) {
    const startDateStr = order.webinar.sessions.length > 0 
      ? new Date(order.webinar.sessions[0].startDate).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        }) + " WIB"
      : "Jadwal Menyusul";

    sendUniversalEmail({
      toEmail: order.user.email,
      subject: `Pendaftaran Berhasil: ${order.webinar.title}`,
      template: RegistrationSuccessTemplate({
        userName: order.user.name || "Peserta",
        webinarTitle: order.webinar.title,
        startDate: startDateStr,
        loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/profile`
      })
    }).catch(err => {
      console.error(`🚨 Gagal mengirim email konfirmasi pembayaran webhook (${externalId}):`, err);
    });
  }

  return {
    success: true,
    orderId: payment.orderId,
    webinarId: payment.order.webinarId
  };
}
