// src/schemas/auth.ts
import { z } from "zod";

// Regex Aturan Kata Sandi: Min 6 karakter, wajib ada 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// 🌟 Regex Aturan Username: Hanya mengizinkan huruf, angka, garis bawah (_), atau titik (.) tanpa spasi
const usernameRegex = /^[a-zA-Z0-9_.]+$/;

export const RegisterSchema = z
  .object({
    // ── 1. CORE USER DATA VALIDATION ──
    name: z
      .string()
      .min(2, "Nama lengkap minimal terdiri dari 2 karakter")
      .max(50, "Nama lengkap maksimal 50 karakter"),
      
    whatsapp: z
      .string()
      .min(9, "Nomor WhatsApp minimal 9 karakter")
      .max(15, "Nomor WhatsApp maksimal 15 karakter")
      .regex(/^[0-9]+$/, "Nomor WhatsApp hanya boleh berisi angka"),

    username: z
      .string()
      .min(3, "Username minimal terdiri dari 3 karakter")
      .max(20, "Username maksimal 20 karakter")
      .regex(
        usernameRegex,
        "Username hanya boleh berisi huruf, angka, garis bawah (_), atau titik (.) tanpa spasi"
      ),

    email: z
      .string()
      .min(1, "Alamat email wajib diisi")
      .email("Format alamat email tidak valid"),

    password: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter")
      .regex(
        passwordRegex,
        "Kata sandi wajib mengandung kombinasi huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&)"
      ),

    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  // ── 2. CROSS FIELD VALIDATION (STRICT REFINEMENT) ──
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok dengan kata sandi utama",
    path: ["confirmPassword"], // Menargetkan pesan error agar muncul tepat di input confirmPassword
  });

// Ekspor tipe data inferred otomatis untuk digunakan pada React Hook Form klien
export type RegisterInput = z.infer<typeof RegisterSchema>;