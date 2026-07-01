import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { HomeHero } from "@/components/features/hero/home-hero";
import WebinarGridList from "@/components/features/webinar-grid/webinar-grid-list";
import { MotionWrapper } from "@/components/ui/motion-wrapper";


// 🌟 PERBAIKAN 1: Pertegas tipe data searchParams sesuai standardisasi Next.js asinkronus
interface HomePageProps {
  searchParams: Promise<{ category?: string; type?: string; status?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  
  // Tunggu penyelesaian resolusi query params dari URL browser
  const resolvedSearchParams = await searchParams;

  // Cari sesi webinar terdekat yang akan datang (isLive = sedang siaran, bukan "akan datang")
  // Filter yang benar: belum selesai (isCompleted: false) + punya sesi di masa depan
  const now = new Date();

  const nearestSession = await prisma.webinarSession.findFirst({
    where: {
      startDate: { gt: now },
      webinar: { isCompleted: false },
    },
    orderBy: { startDate: "asc" },
    include: {
      webinar: {
        include: {
          speakers: { take: 1 },
        },
      },
    },
  });

  let formattedWebinar = null;
  if (nearestSession?.webinar) {
    const w = nearestSession.webinar;
    formattedWebinar = {
      slug: w.slug,
      title: w.title,
      targetDate: new Date(nearestSession.startDate),
      speaker: w.speakers[0] ? {
        name: w.speakers[0].name,
        title: w.speakers[0].title,
        image: w.speakers[0].image,
      } : null,
    };
  }

  // Cari webinar teraktif/terbaru untuk rundown
  const latestWebinar = await prisma.webinar.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      sessions: {
        orderBy: { startDate: "asc" },
      },
    },
  });

  let formattedNearestWebinar = null;
  if (latestWebinar) {
    formattedNearestWebinar = {
      slug: latestWebinar.slug,
      title: latestWebinar.title,
      description: latestWebinar.description,
      imageUrl: latestWebinar.imageUrl,
      sessions: latestWebinar.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        startDate: s.startDate,
        endDate: s.endDate,
        duration: s.duration,
      })),
    };
  }

  return (
    <div className="bg-background text-foreground min-h-screen antialiased font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12 pt-24">
        {/* STRUKTUR UTAMA HOMEPAGE */}
        <main className="space-y-20">

          {/* 1. HERO BANNER ATAS */}
          <MotionWrapper delay={0.1}>
            <HomeHero 
              upcomingWebinar={formattedWebinar} 
              nearestWebinar={formattedNearestWebinar}
              isNewUser={resolvedSearchParams.status === "new_registration"}
            />
          </MotionWrapper>

          {/* 2. DAFTAR GRID WEBINAR & FILTER */}
          <MotionWrapper delay={0.2}>
            <Suspense fallback={<div className="text-center py-20 text-sm font-medium text-muted-foreground animate-pulse">{"Memuat Katalog Webinar..."}</div>}>
              <WebinarGridList searchParams={Promise.resolve(resolvedSearchParams)} />
            </Suspense>
          </MotionWrapper>

        </main>

      </div>
    </div>
  );
}