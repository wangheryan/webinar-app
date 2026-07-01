// src/app/profile/edit/_components/types.ts
import { UserRole } from "@/generated/prisma/enums";

export interface EditProfileInput {
  username: string;
  name: string;
  email: string;
  password?: string;
  whatsapp: string;
  linkedinUrl?: string | null;
  infoSource: "LINKEDIN" | "SOCIAL_MEDIA" | "ADS" | "MARKETING";
  status: "MAHASISWA" | "PROFESSIONAL" | "GENERAL";
  
  // Tahap 2: Parameter Akademik
  institution?: string | null;
  major?: string | null;
  semester?: string | null;
  entryYear?: string | null;
  graduationYear?: string | null;
  
  // Tahap 3: Kualifikasi Praktisi
  companyName?: string | null;
  jobTitle?: string | null;
  sector?: string | null;
  kcmiNumber?: string | null;
  yearsOfExperience?: string | null;
}

export interface PrismaUserPayload {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    userId: string;
    whatsapp: string;
    linkedinUrl: string | null;
    infoSource: string;
    employmentStatus: string;
    createdAt: Date;
    updatedAt: Date;
    academicProfile?: {
      id: string;
      profileId: string;
      institution: string;
      major: string;
      semester: number;
      entryYear: number;
      graduationYear: number;
    } | null;
    professionalProfile?: {
      id: string;
      profileId: string;
      companyName: string;
      jobTitle: string;
      sector: string;
      kcmiNumber: string | null;
      yearsOfExperience: number;
    } | null;
  } | null;
}