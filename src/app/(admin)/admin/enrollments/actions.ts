// src/app/(admin)/admin/enrollments/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { OrderStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export interface AdminEnrollment {
  id: string;
  status: OrderStatus;
  paymentChannel: string | null;
  xenditChannelCode: string | null;
  xenditReferenceId: string | null;
  baseAmount: number;
  addonAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  expiresAt: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
  webinar: {
    title: string;
    slug: string;
  };
  selectedAddons: {
    addon: { name: string };
    priceAtPurchase: number;
  }[];
}

export async function getEnrollments(): Promise<AdminEnrollment[]> {
  await requireRole(["ADMINISTRATOR"]);

  const enrollments = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      webinar: { select: { title: true, slug: true } },
      coupon: { select: { code: true } },
      selectedAddons: {
        include: { addon: { select: { name: true } } },
      },
    },
  });

  return enrollments.map((e) => ({
    id: e.id,
    status: e.status,
    paymentChannel: null, // Note: Payment tracking is moved to separate Payment table, we can fetch it if needed
    xenditChannelCode: null,
    xenditReferenceId: null,
    baseAmount: e.baseAmount,
    addonAmount: e.addonAmount,
    discountAmount: e.discountAmount,
    totalAmount: e.totalAmount,
    couponCode: null,
    expiresAt: null,
    createdAt: e.createdAt.toISOString(),
    user: e.user,
    webinar: e.webinar,
    selectedAddons: e.selectedAddons.map((sa) => ({
      addon: { name: sa.addon.name },
      priceAtPurchase: sa.priceAtPurchase,
    })),
  }));
}

export async function updateEnrollmentStatus(id: string, status: OrderStatus) {
  await requireRole(["ADMINISTRATOR"]);

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/enrollments");
  return { success: true };
}

export async function deleteEnrollment(id: string) {
  await requireRole(["ADMINISTRATOR"]);

  await prisma.order.delete({ where: { id } });

  revalidatePath("/admin/enrollments");
  return { success: true };
}
