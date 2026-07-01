// src/repositories/user.repository.ts
// Data access layer for User and UserProfile models

import prisma from "@/lib/prisma";

/**
 * Find user by email with full profile
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
}

/**
 * Find user by ID with full profile
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
}

/**
 * Find user by username
 */
export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  });
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
}

/**
 * Check if username already exists
 */
export async function usernameExists(username: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { username } });
  return !!user;
}

/**
 * 🌟 REFAKTOR: Mengambil pengguna beserta rekam jejak portofolio (enrollments)
 * Fungsi ini menggeser kueri raksasa dari UI (Profile Page) ke Data Layer.
 */
export async function findUserWithFullEnrollments(identifier: string, isUsername: boolean = false) {
  return prisma.user.findUnique({
    where: isUsername ? { username: identifier } : { id: identifier },
    include: {
      profile: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          webinar: {
            include: {
              speakers: { select: { name: true } },
              sessions: { 
                select: { 
                  startDate: true,
                  meetingUrl: true,
                  recordingUrl: true
                }, 
                orderBy: { startDate: "asc" } 
              }
            }
          },
          selectedAddons: {
            include: {
              addon: { select: { name: true } }
            }
          }
        }
      }
    },
  });
}

