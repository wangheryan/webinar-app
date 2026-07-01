"use server";

import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OnboardingSchema } from "@/schemas/profile";
import { EmploymentStatus, InfoSource } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

// Definisikan struktur interface balikan Action secara gamblang
interface ActionResponse {
  success: boolean;
  message: string;
}

export async function updateProfileActions(
  userIdArg: string,
  profileIdArg: string,
  rawData: unknown
): Promise<ActionResponse> {
  try {
    // 1. Otentikasi Sesi Server Sisi Keamanan (Guard)
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return { success: false, message: "AUTH_FAILED: Sesi Anda telah berakhir." };
    }

    if (session.user.id !== userIdArg) {
      return { success: false, message: "FORBIDDEN: Tindakan mutasi data tidak diizinkan." };
    }

    // 2. Validasi Payload Input Menggunakan Zod Schema
    const validatedFields = OnboardingSchema.safeParse(rawData);
    if (!validatedFields.success) {
      // 🌟 PERBAIKAN STRIKT: Gunakan `.issues` untuk menangani ZodIssue secara murni & Type-Safe
      const firstIssue = validatedFields.error.issues[0];
      return { 
        success: false, 
        message: firstIssue ? firstIssue.message : "VALIDATION_ERROR: Format data tidak valid." 
      };
    }

    const data = validatedFields.data;

    // Helper Sanitisasi: Mengubah string kosong atau spasi menjadi null untuk database
    const sanitizeString = (val: string | null | undefined): string | null => {
      if (!val) return null;
      return val.trim() !== "" ? val.trim() : null;
    };

    // Helper Angka: Mengonversi string input menjadi Number atau null secara aman
    const sanitizeNumber = (val: string | null | undefined): number | null => {
      if (!val || val.trim() === "") return null;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    };

    // 3. Database Atomik Transaksi
    await prisma.$transaction(async (tx) => {
      // A. Perbarui Data Utama Tabel User (Akun Inti)
      await tx.user.update({
        where: { id: userIdArg },
        data: {
          name: data.name.trim(),
          username: data.username.trim().toLowerCase(),
        },
      });

      // B. Jalankan Upsert pada Model Gabungan UserProfile Baru Hasil Denormalisasi
      await tx.userProfile.upsert({
        where: { userId: userIdArg },
        update: {
          whatsapp: data.whatsapp.trim(),
          linkedinUrl: sanitizeString(data.linkedinUrl),
          employmentStatus: data.status as EmploymentStatus,
          infoSource: data.infoSource as InfoSource,
          
          // Parameter Akademik
          institution: sanitizeString(data.institution),
          major: sanitizeString(data.major),
          semester: sanitizeNumber(data.semester),
          entryYear: sanitizeNumber(data.entryYear),
          graduationYear: sanitizeNumber(data.graduationYear),

          // Parameter Profesional
          companyName: sanitizeString(data.companyName),
          jobTitle: sanitizeString(data.jobTitle),
          sector: sanitizeString(data.sector),
          kcmiNumber: sanitizeString(data.kcmiNumber),
          yearsOfExperience: sanitizeNumber(data.yearsOfExperience),
        },
        create: {
          userId: userIdArg,
          whatsapp: data.whatsapp.trim(),
          linkedinUrl: sanitizeString(data.linkedinUrl),
          employmentStatus: data.status as EmploymentStatus,
          infoSource: data.infoSource as InfoSource,
          
          // Parameter Akademik
          institution: sanitizeString(data.institution),
          major: sanitizeString(data.major),
          semester: sanitizeNumber(data.semester),
          entryYear: sanitizeNumber(data.entryYear),
          graduationYear: sanitizeNumber(data.graduationYear),

          // Parameter Profesional
          companyName: sanitizeString(data.companyName),
          jobTitle: sanitizeString(data.jobTitle),
          sector: sanitizeString(data.sector),
          kcmiNumber: sanitizeString(data.kcmiNumber),
          yearsOfExperience: sanitizeNumber(data.yearsOfExperience),
        },
      });
    });

    // 4. Cache Purging & Revalidasi Node Rute Dashboard Profil
    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return { 
      success: true, 
      message: "SUCCESS: Kredensial profil berhasil diperbarui!" 
    };

  } catch (error: unknown) {
    console.error("❌ CRITICAL_UPDATE_PROFILE_ACTION_ERROR:", error);
    
    // Penanganan error database Prisma secara Type-Safe tanpa 'any'
    if (
      error && 
      typeof error === "object" && 
      "code" in error && 
      error.code === "P2002"
    ) {
      return { success: false, message: "DB_ERROR: Username tersebut sudah digunakan oleh member lain." };
    }

    return { 
      success: false, 
      message: "SERVER_ERROR: Terjadi kegagalan internal pada pangkalan data sistem." 
    };
  }
}