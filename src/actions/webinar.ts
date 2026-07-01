"use server";

import prisma from "@/lib/prisma";
import { type WebinarData, type FAQItem, type AccessType } from "@/types/webinar";

interface FetchWebinarsResult {
  success: boolean;
  data: WebinarData[];
  error?: string;
}

/**
 * Server Action murni untuk mengambil data Webinar dari database.
 * Menggunakan `_count` alih-alih memuat seluruh enrollments untuk efisiensi.
 */
export async function getWebinarsPool(): Promise<FetchWebinarsResult> {
  try {
    const dbWebinars = await prisma.webinar.findMany({
      include: {
        speakers: true,
        sessions: {
          orderBy: { startDate: "asc" },
        },
        addons: {
          where: { isActive: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedWebinars: WebinarData[] = dbWebinars.map((webinar) => {
      let parsedFaqs: FAQItem[] = [];
      if (Array.isArray(webinar.faqs)) {
        parsedFaqs = (webinar.faqs as unknown as FAQItem[]).map((item) => ({
          q: String(item?.q ?? ""),
          a: String(item?.a ?? ""),
        }));
      }

      return {
        id: webinar.id,
        title: webinar.title,
        subtitle: webinar.subtitle,
        duration: webinar.duration,
        category: webinar.category,
        basePrice: webinar.basePrice,
        accessType: webinar.accessType as AccessType,
        imageUrl: webinar.imageUrl,
        abstract: webinar.abstract,
        isLive: webinar.isLive,
        faqs: parsedFaqs,
        createdAt: webinar.createdAt,
        updatedAt: webinar.updatedAt,
        speakers: webinar.speakers.map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          title: speaker.title,
          company: speaker.company,
          image: speaker.image,
          bio: speaker.bio,
          credentials: speaker.credentials,
          linkedinUrl: speaker.linkedinUrl,
          websiteUrl: speaker.websiteUrl,
          createdAt: speaker.createdAt,
          updatedAt: speaker.updatedAt,
        })),
        sessions: webinar.sessions.map((s) => ({
          id: s.id,
          webinarId: s.webinarId,
          title: s.title,
          startDate: s.startDate,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
        addons: webinar.addons.map((a) => ({
          id: a.id,
          webinarId: a.webinarId,
          name: a.name,
          description: a.description,
          price: a.price,
          isActive: a.isActive,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        })),
        enrollmentCount: webinar._count.orders,
      };
    });

    return {
      success: true,
      data: formattedWebinars,
    };
  } catch (error) {
    console.error("❌ Database Server Action Error:", error);
    return {
      success: false,
      data: [],
      error: "Gagal menyinkronkan data webinar dari database.",
    };
  }
}