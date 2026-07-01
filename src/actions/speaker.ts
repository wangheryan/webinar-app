"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSpeakersPool() {
  try {
    const speakers = await prisma.speaker.findMany({
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: speakers };
  } catch (error) {
    console.error("GET_SPEAKERS_ERROR:", error);
    return { success: false, data: [], error: "Gagal memuat data instruktur." };
  }
}

export type SpeakerInput = {
  name: string;
  title: string;
  company?: string | null;
  image: string;
  bio?: string | null;
  credentials: string[];
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
};

export async function createSpeaker(data: SpeakerInput) {
  try {
    await requireRole(["ADMINISTRATOR"]);
    
    const speaker = await prisma.speaker.create({
      data: {
        ...data,
      }
    });
    
    revalidatePath("/admin/instructors");
    return { success: true, data: speaker };
  } catch (error) {
    console.error("CREATE_SPEAKER_ERROR:", error);
    return { success: false, error: "Gagal menambahkan instruktur." };
  }
}

export async function updateSpeaker(id: string, data: SpeakerInput) {
  try {
    await requireRole(["ADMINISTRATOR"]);
    
    const speaker = await prisma.speaker.update({
      where: { id },
      data: {
        ...data,
      }
    });
    
    revalidatePath("/admin/instructors");
    return { success: true, data: speaker };
  } catch (error) {
    console.error("UPDATE_SPEAKER_ERROR:", error);
    return { success: false, error: "Gagal memperbarui instruktur." };
  }
}

export async function deleteSpeaker(id: string) {
  try {
    await requireRole(["ADMINISTRATOR"]);
    
    await prisma.speaker.delete({
      where: { id }
    });
    
    revalidatePath("/admin/instructors");
    return { success: true };
  } catch (error) {
    console.error("DELETE_SPEAKER_ERROR:", error);
    return { success: false, error: "Gagal menghapus instruktur." };
  }
}
