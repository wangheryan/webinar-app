// src/repositories/webinar.repository.ts
// Data access layer for Webinar, Speaker, and Session models

import prisma from "@/lib/prisma";

/**
 * Find webinar by slug with all relations
 */
export async function findWebinarBySlug(slug: string) {
  return prisma.webinar.findUnique({
    where: { slug },
    include: {
      speakers: true,
      sessions: { orderBy: { startDate: "asc" } },
      addons: { where: { isActive: true } },
    },
  });
}

/**
 * Find webinar by ID with addons
 */
export async function findWebinarById(id: string) {
  return prisma.webinar.findUnique({
    where: { id },
    include: { addons: true },
  });
}

/**
 * Get all distinct categories
 */
export async function getDistinctCategories() {
  return prisma.webinar.findMany({
    select: { category: true },
    distinct: ["category"],
  });
}

/**
 * Find nearest upcoming live webinar
 */
export async function findNearestLiveWebinar() {
  const now = new Date();
  
  return prisma.webinar.findFirst({
    where: {
      isLive: true,
      isCompleted: false,
      sessions: { some: { startDate: { gte: now } } },
    },
    include: {
      speakers: { take: 1 },
      sessions: {
        where: { startDate: { gte: now } },
        take: 1,
        orderBy: { startDate: "asc" },
      },
    },
  });
}

/**
 * Get all valid participants (SETTLED enrollments) for a specific webinar
 */
export async function getWebinarParticipants(webinarId: string) {
  return prisma.order.findMany({
    where: {
      webinarId,
      status: "SUCCESS", // Hanya ambil yang pembayarannya sudah lunas/sukses (termasuk hasil migrasi)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              institution: true,
              employmentStatus: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
