// src/actions/auth.ts
"use server";

import prisma from "@/lib/prisma";
import { RegisterSchema, type RegisterInput } from "@/schemas/auth";
import { sendUniversalEmail } from "@/services/email.service";
import { OtpEmailTemplate } from "@/components/emails/otp-template"; // Pastikan Anda sudah membuat template komponen ini
import * as bcrypt from "bcrypt";

/**
 * 1. ACTION: Registrasi Akun & Pengiriman OTP Awal (Strict Type-Safe)
 */
export async function registerUser(data: RegisterInput) {
  try {
    // Validasi server-side menggunakan skema Zod esensial (6 kolom)
    const validatedFields = RegisterSchema.safeParse(data);
    
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Payload data tidak valid. Periksa kembali input Anda.",
      };
    }

    const { name, username, email, password, whatsapp } = validatedFields.data;

    // Periksa apakah alamat email sudah terdaftar
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return {
        success: false,
        message: "Alamat email ini sudah terdaftar di sistem.",
      };
    }

    // Periksa apakah username sudah terdaftar
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return {
        success: false,
        message: "Username sudah digunakan oleh participant lain.",
      };
    }

    // Hashing password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-Digit Otp aman
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // Masa aktif token: 15 Menit

    // Eksekusi transaksi database (Atomic Transaction Isolation)
    await prisma.$transaction(async (tx) => {
      // Create User dengan status non-aktif terlebih dahulu (Menunggu OTP)
      await tx.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          role: "PARTICIPANT",
          isActive: false, // Diaktifkan HANYA setelah OTP sukses verifikasi
          profile: {
            create: {
              whatsapp,
              employmentStatus: "GENERAL",
              infoSource: "SOCIAL_MEDIA",
            },
          },
        },
      });

      // Simpan Token Verifikasi di Database
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: generatedOtp,
          expires: otpExpiry,
        },
      });
    });

    // ── 🌟 INTEGRASI PORT ENGINE EMAIL PREMIUM ──
    const emailResult = await sendUniversalEmail({
      toEmail: email,
      subject: `[Geocore] Kode Aktivasi Akun — ${generatedOtp}`,
      template: OtpEmailTemplate({ otpCode: generatedOtp }),
    });

    if (!emailResult.success) {
      return {
        success: false,
        message: emailResult.message, // Menyuntikkan pesan interaktif humanis dari mail engine
      };
    }

    return {
      success: true,
      message: "Kode token aktivasi telah dikirim ke email Anda.",
    };

  } catch (error: unknown) {
    console.error("❌ Eror pada proses registerUser Action:", error);
    
    let detailMessage = "Terjadi kesalahan internal pada sistem alokasi server.";
    if (error instanceof Error) {
      detailMessage = `Registrasi gagal: ${error.message}`;
    }

    return {
      success: false,
      message: detailMessage,
    };
  }
}

/**
 * 2. ACTION: Validasi Kode OTP & Aktivasi Node User (Strict Type-Safe)
 */
export async function verifyEmailOtp(email: string, otpCode: string) {
  try {
    if (!email || !otpCode) {
      return { success: false, message: "Parameter verifikasi tidak lengkap." };
    }

    // Cari rekaman kode OTP terbaru untuk email ini
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otpCode,
      },
      orderBy: { expires: "desc" },
    });

    if (!record) {
      return {
        success: false,
        message: "Kode token verifikasi salah atau tidak terdaftar.",
      };
    }

    // Periksa apakah token sudah melewati batas kedaluwarsa
    if (new Date() > record.expires) {
      return {
        success: false,
        message: "Kode token telah kedaluwarsa. Silakan minta kode baru.",
      };
    }

    // Transaksi Aktivasi Akun Sekaligus Pembersihan Sampah Token
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { isActive: true },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: email },
      }),
    ]);

    return {
      success: true,
      message: "Node identitas terverifikasi sempurna. Akun aktif!",
    };

  } catch (error: unknown) {
    console.error("❌ Eror pada proses verifyEmailOtp Action:", error);
    return {
      success: false,
      message: "Gagal memproses validasi jabat tangan keamanan database.",
    };
  }
}

/**
 * 3. ACTION: Pengiriman Ulang (Resend) OTP Baru (Strict Type-Safe)
 */
export async function resendEmailOtp(email: string) {
  try {
    if (!email) return { success: false, message: "Email pengiriman wajib disertakan." };

    // Pastikan user memang ada dan belum aktif
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "Email tidak terdaftar." };
    if (user.isActive) return { success: false, message: "Akun ini sudah aktif." };

    // Generate OTP baru
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.$transaction([
      // Bersihkan kuki token lama agar hemat memori database
      prisma.verificationToken.deleteMany({ where: { identifier: email } }),
      // Masukkan token baru
      prisma.verificationToken.create({
        data: {
          identifier: email,
          token: newOtp,
          expires: otpExpiry,
        },
      }),
    ]);

    // ── 🌟 INTEGRASI PORT ENGINE EMAIL PREMIUM PADA RESEND CYCLE ──
    const emailResult = await sendUniversalEmail({
      toEmail: email,
      subject: `[Geocore] Kirim Ulang Kode Aktivasi — ${newOtp}`,
      template: OtpEmailTemplate({ otpCode: newOtp }),
    });

    if (!emailResult.success) {
      return {
        success: false,
        message: emailResult.message,
      };
    }

    return {
      success: true,
      message: "Kode verifikasi baru berhasil dikirim ulang ke email.",
    };

  } catch (error: unknown) {
    console.error("❌ Eror pada proses resendEmailOtp Action:", error);
    return {
      success: false,
      message: "Gagal memicu pengiriman ulang siklus token database.",
    };
  }
}

// Tambahkan fungsi ini ke dalam src/actions/auth.ts

/**
 * 🔒 Memeriksa apakah suatu email sudah mencapai batas ambang 5x salah login
 */
export async function checkLoginAttemptsStatus(email: string): Promise<boolean> {
  if (!email) return false;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { loginAttempts: true }
    });

    // Jika user ditemukan dan pencatatan kegagalan sudah >= 5, kembalikan nilai true (wajib CAPTCHA)
    return user ? user.loginAttempts >= 5 : false;
  } catch (error: unknown) {
    console.error("❌ Gagal memeriksa status login attempts:", error);
    return false;
  }
}

/**
 * 🔄 Mencatat kegagalan baru atau mereset hitungan jika sukses
 * Fungsi ini akan dipanggil di dalam alur otentikasi backend Anda
 */
export async function recordLoginAttempt(email: string, isSuccess: boolean): Promise<void> {
  try {
    if (isSuccess) {
      // Jika berhasil masuk, kembalikan hitungan ke angka 0
      await prisma.user.update({
        where: { email },
        data: { loginAttempts: 0 }
      });
    } else {
      // Jika gagal, naikkan nilai attempts sebanyak +1
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.user.update({
          where: { email },
          data: { loginAttempts: { increment: 1 } }
        });
      }
    }
  } catch (error: unknown) {
    console.error("❌ Gagal memperbarui catatan login attempt:", error);
  }
}