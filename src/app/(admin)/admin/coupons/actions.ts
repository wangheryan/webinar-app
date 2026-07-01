// src/app/(admin)/admin/coupons/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { CouponType } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  minPurchase: number;
  qtyTotal: number;
  qtyAvailable: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    usages: number;
    orders: number;
  };
}

export async function getCoupons(): Promise<AdminCoupon[]> {
  await requireRole(["ADMINISTRATOR"]);

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { usages: true, orders: true } },
    },
  });

  return coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    maxDiscount: c.maxDiscount,
    minPurchase: c.minPurchase,
    qtyTotal: c.qtyTotal,
    qtyAvailable: c.qtyAvailable,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    _count: c._count,
  }));
}

interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minPurchase: number;
  qtyTotal: number;
  startDate: string;
  endDate: string;
}

export async function createCoupon(data: CouponInput) {
  await requireRole(["ADMINISTRATOR"]);

  await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase().trim(),
      type: data.type,
      value: data.value,
      maxDiscount: data.maxDiscount || null,
      minPurchase: data.minPurchase,
      qtyTotal: data.qtyTotal,
      qtyAvailable: data.qtyTotal,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: true,
    },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, data: Partial<CouponInput & { isActive: boolean }>) {
  await requireRole(["ADMINISTRATOR"]);

  await prisma.coupon.update({
    where: { id },
    data: {
      ...(data.code && { code: data.code.toUpperCase().trim() }),
      ...(data.type && { type: data.type }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount || null }),
      ...(data.minPurchase !== undefined && { minPurchase: data.minPurchase }),
      ...(data.qtyTotal !== undefined && { qtyTotal: data.qtyTotal }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActive(id: string) {
  await requireRole(["ADMINISTRATOR"]);

  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new Error("Coupon not found");

  await prisma.coupon.update({
    where: { id },
    data: { isActive: !coupon.isActive },
  });

  revalidatePath("/admin/coupons");
  return { success: true, isActive: !coupon.isActive };
}

export async function deleteCoupon(id: string) {
  await requireRole(["ADMINISTRATOR"]);

  await prisma.coupon.delete({ where: { id } });

  revalidatePath("/admin/coupons");
  return { success: true };
}
