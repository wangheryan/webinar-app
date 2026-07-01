// src/app/api/webinars/upcoming/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // 🌟 PERBAIKAN: Cari langsung ke tabel WebinarSession agar mendapatkan sesi terdekat yang BENAR-BENAR di masa depan
    const upcomingSession = await prisma.webinarSession.findFirst({
      where: {
        startDate: {
          gt: now, // Harus lebih besar dari detik ini
        },
        webinar: {
          isCompleted: false,
          isLive: false,
        },
      },
      include: {
        webinar: {
          select: {
            title: true,
            slug: true,
            category: true,
          },
        },
      },
      orderBy: {
        startDate: "asc", // Sesi paling dekat dengan waktu sekarang ditaruh paling atas
      },
    });

    if (!upcomingSession || !upcomingSession.webinar) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        title: upcomingSession.webinar.title,
        slug: upcomingSession.webinar.slug,
        category: upcomingSession.webinar.category,
        startDate: upcomingSession.startDate, // Otomatis mengembalikan tanggal sesi masa depan yang valid
      },
    });
  } catch (error: unknown) {
    console.error("❌ UPCOMING_WEBINAR_API_ERROR:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}