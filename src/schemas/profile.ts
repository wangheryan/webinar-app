// src/schemas/profile.ts
import { z } from "zod";

export const OnboardingSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_.]+$/),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().optional(),
  whatsapp: z.string().min(9).regex(/^[0-9]+$/),
  linkedinUrl: z.string().url().optional().or(z.literal("")).nullable(),
  infoSource: z.enum(["LINKEDIN", "SOCIAL_MEDIA", "ADS", "MARKETING"]),
  status: z.enum(["MAHASISWA", "PROFESSIONAL", "GENERAL"]),
  
  institution: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  semester: z.string().nullable().optional(),
  entryYear: z.string().nullable().optional(),
  graduationYear: z.string().nullable().optional(),

  companyName: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  kcmiNumber: z.string().nullable().optional(),
  yearsOfExperience: z.string().nullable().optional(),
});

// 🌟 TAMBAHKAN INI: Tipe data tunggal resmi untuk form pertambangan Anda
export type OnboardingFormValues = z.infer<typeof OnboardingSchema>;