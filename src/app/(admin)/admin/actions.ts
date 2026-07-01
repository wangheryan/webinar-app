// src/app/(admin)/admin/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { OrderStatus } from "@/generated/prisma/client";

export interface DashboardStats {
  totalUsers: number;
  totalWebinars: number;
  totalEnrollments: number;
  totalRevenue: number;
  enrollmentsByStatus: { status: string; count: number }[];
  recentEnrollments: {
    id: string;
    userName: string | null;
    userEmail: string | null;
    webinarTitle: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    paymentChannel: string | null;
  }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireRole(["ADMINISTRATOR"]);

  const [
    totalUsers,
    totalWebinars,
    totalEnrollments,
    revenueResult,
    pendingCount,
    settledCount,
    expiredCount,
    failedCount,
    recentEnrollmentsRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.webinar.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "SUCCESS" } }),
    prisma.order.count({ where: { status: "EXPIRED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        webinar: { select: { title: true } },
      },
    }),
  ]);

  // Monthly revenue for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const settledEnrollments = await prisma.order.findMany({
    where: {
      status: "SUCCESS",
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
  });

  const revenueByMonth = new Map<string, number>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    revenueByMonth.set(key, 0);
  }

  settledEnrollments.forEach((e) => {
    const d = new Date(e.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + e.totalAmount);
    }
  });

  const monthlyRevenue = Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  return {
    totalUsers,
    totalWebinars,
    totalEnrollments,
    totalRevenue: revenueResult._sum.totalAmount || 0,
    enrollmentsByStatus: [
      { status: "PENDING", count: pendingCount },
      { status: "SUCCESS", count: settledCount },
      { status: "EXPIRED", count: expiredCount },
      { status: "CANCELLED", count: failedCount },
    ],
    recentEnrollments: recentEnrollmentsRaw.map((e) => ({
      id: e.id,
      userName: e.user.name,
      userEmail: e.user.email,
      webinarTitle: e.webinar.title,
      status: e.status,
      totalAmount: e.totalAmount,
      createdAt: e.createdAt.toISOString(),
      paymentChannel: null,
    })),
    monthlyRevenue,
  };
}
