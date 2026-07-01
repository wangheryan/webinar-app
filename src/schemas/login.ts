// src/schemas/login.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal terdiri dari 6 karakter"),
});

// Infer tipe data dari Zod schema untuk digunakan secara strict di TypeScript
export type LoginInput = z.infer<typeof LoginSchema>;