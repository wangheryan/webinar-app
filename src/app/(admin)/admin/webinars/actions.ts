"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AccessType } from "@/generated/prisma/client";

interface AdminWebinarSpeaker {
  id: string;
  name: string;
  title: string;
}

interface AdminWebinarSession {
  id?: string;
  tempId?: string;
  title: string;
  startDate: string;
  endDate: string;
  duration: string;
  meetingUrl: string;
  recordingUrl: string;
  isDeleted?: boolean;
}

interface AdminWebinarAddon {
  id?: string;
  tempId?: string;
  name: string;
  price: number;
  description?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
}

interface AdminWebinarResource {
  title: string;
  url: string;
}

export interface AdminWebinar {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string | null;
  duration?: string;
  category: string;
  basePrice: number;
  accessType: string;
  imageUrl: string;
  abstract: string;
  materialUrl?: string | null;
  resources?: AdminWebinarResource[];
  isLive: boolean;
  isCompleted: boolean;
  speakers: AdminWebinarSpeaker[];
  addons: AdminWebinarAddon[];
  sessions?: AdminWebinarSession[];
  _count?: { participants: number };
}

export async function getSpeakersForSelect() {
  await requireRole(["ADMINISTRATOR"]);
  return prisma.speaker.findMany({
    select: { id: true, name: true, title: true },
    orderBy: { name: "asc" }
  });
}

export async function getWebinarById(id: string): Promise<AdminWebinar | null> {
  await requireRole(["ADMINISTRATOR"]);
  const w = await prisma.webinar.findUnique({
    where: { id },
    include: {
      speakers: true,
      addons: true,
      sessions: { orderBy: { startDate: "asc" } }
    }
  });

  if (!w) return null;

  return {
    ...w,
    accessType: w.accessType as string,
    sessions: w.sessions.map(s => ({
      id: s.id,
      title: s.title,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      duration: s.duration || "",
      meetingUrl: s.meetingUrl || "",
      recordingUrl: s.recordingUrl || ""
    })),
    resources: Array.isArray(w.resources) ? (w.resources as unknown as AdminWebinarResource[]) : []
  };
}

export async function toggleWebinarLive(id: string) {
  await requireRole(["ADMINISTRATOR"]);
  const webinar = await prisma.webinar.findUnique({ where: { id } });
  if (!webinar) throw new Error("Webinar not found");
  
  const updated = await prisma.webinar.update({
    where: { id },
    data: { isLive: !webinar.isLive },
  });
  revalidatePath("/admin/webinars");
  return { isLive: updated.isLive };
}

export async function toggleWebinarCompleted(id: string) {
  await requireRole(["ADMINISTRATOR"]);
  const webinar = await prisma.webinar.findUnique({ where: { id } });
  if (!webinar) throw new Error("Webinar not found");
  
  const updated = await prisma.webinar.update({
    where: { id },
    data: { isCompleted: !webinar.isCompleted },
  });
  revalidatePath("/admin/webinars");
  return { isCompleted: updated.isCompleted };
}

export async function deleteWebinar(id: string) {
  await requireRole(["ADMINISTRATOR"]);
  await prisma.webinar.delete({ where: { id } });
  revalidatePath("/admin/webinars");
  return { success: true };
}

interface WebinarInput {
  slug: string;
  title: string;
  subtitle: string;
  description?: string;
  duration: string;
  category: string;
  basePrice: number;
  accessType: "FREE" | "PAID" | "HYBRID";
  imageUrl: string;
  abstract: string;
  materialUrl?: string;
  isLive?: boolean;
  isCompleted?: boolean;
  resources?: { title: string; url: string }[];
  faqs?: { question: string; answer: string }[];
  speakerIds: string[];
  sessions?: {
    id?: string;
    tempId?: string;
    title: string;
    startDate: string;
    endDate: string;
    duration?: string;
    meetingUrl?: string;
    recordingUrl?: string;
    isDeleted?: boolean;
  }[];
  addons: {
    id?: string;
    tempId?: string;
    name: string;
    price: number;
    description?: string | null;
    isActive?: boolean;
    isDeleted?: boolean;
  }[];
}

export async function createWebinar(data: WebinarInput) {
  await requireRole(["ADMINISTRATOR"]);
  
  await prisma.webinar.create({
    data: {
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description || null,
      duration: data.duration,
      category: data.category,
      basePrice: data.basePrice,
      accessType: data.accessType as AccessType,
      imageUrl: data.imageUrl,
      abstract: data.abstract,
      materialUrl: data.materialUrl || null,
      isLive: data.isLive || false,
      isCompleted: data.isCompleted || false,
      faqs: data.faqs || [],
      resources: data.resources || [],
      speakers: {
        connect: data.speakerIds.map(id => ({ id }))
      },
      sessions: {
        create: (data.sessions || [])
          .filter(s => !s.isDeleted)
          .map(s => ({
            title: s.title,
            startDate: new Date(s.startDate),
            endDate: new Date(s.endDate),
            duration: s.duration || null,
            meetingUrl: s.meetingUrl || null,
            recordingUrl: s.recordingUrl || null,
          }))
      },
      addons: {
        create: data.addons
          .filter(a => !a.isDeleted)
          .map(a => ({
            name: a.name,
            price: a.price,
            description: a.description || null,
            isActive: a.isActive !== false
          }))
      }
    }
  });

  revalidatePath("/admin/webinars");
  return { success: true };
}

export async function updateWebinar(id: string, data: WebinarInput) {
  await requireRole(["ADMINISTRATOR"]);

  const addonsToCreate = data.addons.filter(a => !a.id && !a.isDeleted);
  const addonsToUpdate = data.addons.filter(a => a.id && !a.isDeleted);
  const addonsToDelete = data.addons.filter(a => a.id && a.isDeleted);

  const sessionsToCreate = (data.sessions || []).filter(s => !s.id && !s.isDeleted);
  const sessionsToUpdate = (data.sessions || []).filter(s => s.id && !s.isDeleted);
  const sessionsToDelete = (data.sessions || []).filter(s => s.id && s.isDeleted);

  await prisma.webinar.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description || null,
      duration: data.duration,
      category: data.category,
      basePrice: data.basePrice,
      accessType: data.accessType as AccessType,
      imageUrl: data.imageUrl,
      abstract: data.abstract,
      materialUrl: data.materialUrl || null,
      isLive: data.isLive || false,
      isCompleted: data.isCompleted || false,
      faqs: data.faqs || [],
      resources: data.resources || [],
      speakers: {
        set: data.speakerIds.map(sId => ({ id: sId }))
      },
      sessions: {
        create: sessionsToCreate.map(s => ({
          title: s.title,
          startDate: new Date(s.startDate),
          endDate: new Date(s.endDate),
          duration: s.duration || null,
          meetingUrl: s.meetingUrl || null,
          recordingUrl: s.recordingUrl || null,
        })),
        update: sessionsToUpdate.map(s => ({
          where: { id: s.id! },
          data: {
            title: s.title,
            startDate: new Date(s.startDate),
            endDate: new Date(s.endDate),
            duration: s.duration || null,
            meetingUrl: s.meetingUrl || null,
            recordingUrl: s.recordingUrl || null,
          }
        })),
        delete: sessionsToDelete.map(s => ({ id: s.id! }))
      },
      addons: {
        create: addonsToCreate.map(a => ({
          name: a.name,
          price: a.price,
          description: a.description || null,
          isActive: a.isActive !== false
        })),
        update: addonsToUpdate.map(a => ({
          where: { id: a.id },
          data: {
            name: a.name,
            price: a.price,
            description: a.description || null,
            isActive: a.isActive !== false
          }
        })),
        delete: addonsToDelete.map(a => ({ id: a.id }))
      }
    }
  });

  revalidatePath("/admin/webinars");
  return { success: true };
}

export async function getWebinars(): Promise<AdminWebinar[]> {
  await requireRole(["ADMINISTRATOR"]);
  const webinars = await prisma.webinar.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      speakers: {
        select: { id: true, name: true, title: true }
      },
      addons: {
        select: { id: true, name: true, price: true, description: true, isActive: true }
      },
      _count: {
        select: { participants: true }
      }
    }
  });

  return webinars.map(w => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    subtitle: w.subtitle,
    category: w.category,
    basePrice: w.basePrice,
    accessType: w.accessType,
    imageUrl: w.imageUrl,
    abstract: w.abstract,
    description: w.description,
    isLive: w.isLive,
    isCompleted: w.isCompleted,
    speakers: w.speakers,
    addons: w.addons,
    _count: w._count
  }));
}
