import { UserRole, EmploymentStatus } from "@/generated/prisma/client";

export interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  whatsapp?: string | null;
  status: EmploymentStatus | null;
  institution: string | null;
  jobTitle: string | null;
  image: string | null;
}

export type ProfileTabType = "overview" | "webinars" | "certificates";