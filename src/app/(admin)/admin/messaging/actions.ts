"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { emailService } from "@/services/email/email.service";
import { AdminMessageTemplate } from "@/components/emails/admin-message-template";
import React from "react";

const messagingSchema = z.object({
  toEmails: z.string().min(1, "Alamat email tujuan harus diisi"),
  subject: z.string().min(1, "Subjek pesan harus diisi"),
  message: z.string().min(10, "Pesan terlalu singkat (minimal 10 karakter)"),
});

export async function sendAdminMessage(data: z.infer<typeof messagingSchema>) {
  try {
    const user = await getCurrentUser();
    
    // Pastikan hanya admin yang bisa melakukan ini
    if (!user || user.role !== "ADMINISTRATOR") {
      return { success: false, error: "Akses ditolak. Anda tidak memiliki izin." };
    }

    const validatedData = messagingSchema.parse(data);

    // Proses comma-separated emails, trim whitespace
    const targetEmails = validatedData.toEmails
      .split(",")
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (targetEmails.length === 0) {
      return { success: false, error: "Tidak ada alamat email valid yang ditemukan." };
    }

    // Panggil service email rekayasa yang baru
    const result = await emailService.sendEmail({
      toEmail: targetEmails,
      subject: validatedData.subject,
      template: React.createElement(AdminMessageTemplate, {
        message: validatedData.message,
        subject: validatedData.subject
      }),
    });

    if (!result.success) {
      return { success: false, error: result.message };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Messaging Action Error:", error);
    return { success: false, error: "Terjadi kesalahan sistem yang tidak terduga." };
  }
}
