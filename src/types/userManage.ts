import { UserRole } from "@/generated/prisma/client";


export interface ManagedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  institution: string | null;
}