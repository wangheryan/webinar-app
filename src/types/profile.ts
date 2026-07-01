// src/types/profile.ts
import { OrderStatus, UserRole, EmploymentStatus } from "@/generated/prisma/client";

export interface LocalWebinarHistoryItem {
  id: string;
  title: string;
  speaker: string;
  date: Date | string; // Mengakomodasi objek DateTime PostgreSQL Baru
  hours: number;
  tierName: string;
  priceType: string;
  status: string;
  hasCertificate: boolean;
  certificateNumber: string | null;
}

export interface EnrollmentTimelineItem {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  webinar: {
    title: string;
    category: string;
    duration: string;
    materialUrl: string | null;
    speakers: { name: string }[];
    sessions: { 
      startDate: Date;
      meetingUrl: string | null;
      recordingUrl: string | null;
    }[]; // Menyesuaikan dengan kolom skema baru
  };
  selectedAddons: { addon: { name: string } }[];
}

export interface ProfileMetadataParams {
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  email: string | null;
  profile: {
    whatsapp: string | null;
    linkedinUrl: string | null;
    employmentStatus: EmploymentStatus;
    institution: string | null;
    major: string | null;
    companyName: string | null;
    jobTitle: string | null;
  } | null;
}