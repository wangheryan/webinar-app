import { z } from "zod";
import { CouponType } from "@/generated/prisma/client"

export const ApplyCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Kode kupon tidak boleh kosong")
    .trim()
    .toUpperCase(), // Memastikan case-insensitive di sisi pengguna
  webinarId: z.string().cuid("Format ID Webinar tidak valid"),
});

export const AdminCreateCouponSchema = z.object({
  code: z.string().min(3, "Kode minimal 3 karakter").toUpperCase(),
  type: z.nativeEnum(CouponType),
  value: z.number().int().positive("Nilai potongan harus bernilai positif"),
  maxDiscount: z.number().int().positive().nullable().optional(),
  minPurchase: z.number().int().nonnegative(),
  qtyTotal: z.number().int().positive(),
  startDate: z.date(),
  endDate: z.date(),
});