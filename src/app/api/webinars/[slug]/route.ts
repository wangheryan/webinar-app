// src/app/api/webinars/[slug]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    
    if (!resolvedParams || !resolvedParams.slug) {
      return NextResponse.json({ error: "Parameter slug tidak valid" }, { status: 400 });
    }

    const safeSlug = String(resolvedParams.slug).valueOf();


const webinar = await prisma.webinar.findUnique({
  where: { slug: safeSlug },
  include: {
    speakers: {
      select: {
        name: true,
        title: true,
        company: true,
        image: true
      }
    },
    addons: {
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        isActive: true
      }
    },
    sessions: {
      orderBy: {
        startDate: "asc" // 🌟 Menampilkan urutan jadwal sesi dari yang pertama
      },
      select: {
        id: true,
        title: true,
        startDate: true
      }
    },
    _count: {
      select: { participants: true }
    }
  }
});

    if (!webinar) {
      return NextResponse.json({ error: "Webinar tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(webinar);
  } catch (error) {
    console.error("🚨 API_WEBINAR_ERROR:", error);
    
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}