// src/types/auth.d.ts
import { DefaultSession } from "next-auth";
import { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
      whatsapp?: string | null;
      isNewUser: boolean; // 🌟 BARU: Detektor Onboarding Akun
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    isActive: boolean;
    whatsapp?: string | null;
    isNewUser: boolean; // 🌟 BARU
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isActive: boolean;
    whatsapp?: string | null;
    isNewUser: boolean; // 🌟 BARU
  }
}