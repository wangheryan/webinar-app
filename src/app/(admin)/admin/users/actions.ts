// src/app/(admin)/admin/users/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  role: UserRole;
  isActive: boolean;
  loginAttempts: number;
  createdAt: string;
  profile: {
    whatsapp: string | null;
    employmentStatus: string;
    institution: string | null;
    companyName: string | null;
    jobTitle: string | null;
  } | null;
  _count: {
    orders: number;
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  await requireRole(["ADMINISTRATOR"]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: {
        select: {
          whatsapp: true,
          employmentStatus: true,
          institution: true,
          companyName: true,
          jobTitle: true,
        },
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    isActive: u.isActive,
    loginAttempts: u.loginAttempts,
    createdAt: u.createdAt.toISOString(),
    profile: u.profile
      ? {
          whatsapp: u.profile.whatsapp,
          employmentStatus: u.profile.employmentStatus,
          institution: u.profile.institution,
          companyName: u.profile.companyName,
          jobTitle: u.profile.jobTitle,
        }
      : null,
    _count: u._count,
  }));
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireRole(["ADMINISTRATOR"]);

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string) {
  await requireRole(["ADMINISTRATOR"]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/users");
  return { success: true, isActive: !user.isActive };
}

export async function deleteUser(userId: string) {
  await requireRole(["ADMINISTRATOR"]);

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  return { success: true };
}
