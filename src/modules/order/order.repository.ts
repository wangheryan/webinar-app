import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

/**
 * 🚀 HIGH PERFORMANCE REPOSITORY
 * Semua query di sini didesain untuk menghindari N+1.
 */

export async function getOrderCreationContext(webinarId: string, userEmail: string) {
  // Batching 2 independent queries into 1 parallel execution via Promise.all
  // Ini memangkas latency network ke database hingga 50%
  const [webinar, user] = await Promise.all([
    prisma.webinar.findUnique({
      where: { id: webinarId },
      select: {
        id: true,
        basePrice: true,
        title: true,
        addons: {
          where: { isActive: true },
          select: { id: true, price: true }
        },
        sessions: {
          orderBy: { startDate: "asc" },
          take: 1,
          select: { startDate: true }
        }
      }
    }),
    prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        profile: { select: { whatsapp: true } },
        // Cek existing order langsung di query user (O(1) relation lookup, tanpa query ketiga)
        orders: {
          where: { webinarId },
          select: { id: true, status: true }
        }
      }
    })
  ]);

  return { webinar, user };
}

export async function clearStaleOrder(orderId: string) {
  return prisma.order.delete({
    where: { id: orderId }
  });
}

export async function createOrderWithPayment(data: {
  userId: string;
  webinarId: string;
  baseAmount: number;
  addonAmount: number;
  totalAmount: number;
  selectedAddons: { addonId: string; priceAtPurchase: number }[];
  isFree: boolean;
  xenditReferenceId: string;
  xenditPaymentData: string | null;
  xenditExpiryDate: Date | null;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Create Order
    const order = await tx.order.create({
      data: {
        userId: data.userId,
        webinarId: data.webinarId,
        status: data.isFree ? OrderStatus.SUCCESS : OrderStatus.PENDING,
        baseAmount: data.baseAmount,
        addonAmount: data.addonAmount,
        discountAmount: 0,
        totalAmount: data.totalAmount,
        selectedAddons: data.selectedAddons.length > 0 ? {
          create: data.selectedAddons
        } : undefined,
        
        // 2. Create Payment Relation Atomically
        payments: {
          create: {
            amount: data.totalAmount,
            provider: "XENDIT",
            xenditExternalId: data.xenditReferenceId,
            paymentMethod: data.isFree ? "FREE" : "QRIS", // Asumsikan QRIS untuk sekarang
            status: data.isFree ? PaymentStatus.PAID : PaymentStatus.PENDING,
            expiresAt: data.xenditExpiryDate
          }
        }
      }
    });

    // 3. Grant Access if Free
    if (data.isFree) {
      await tx.webinarParticipant.create({
        data: {
          userId: data.userId,
          webinarId: data.webinarId,
          isAttended: false
        }
      });
    }

    return order;
  });
}
