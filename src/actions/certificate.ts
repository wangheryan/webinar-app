"use server";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCertificates() {
  try {
    await requireRole(["ADMINISTRATOR"]);
    const certificates = await prisma.certificate.findMany({
      include: {
        user: { select: { name: true, email: true } },
        webinar: { select: { title: true, slug: true } }
      },
      orderBy: { issueDate: "desc" }
    });
    return { success: true, data: certificates };
  } catch (error) {
    console.error("GET_CERTIFICATES_ERROR:", error);
    return { success: false, data: [], error: "Gagal memuat data sertifikat." };
  }
}

export async function createCertificate(email: string, webinarSlug: string) {
  try {
    await requireRole(["ADMINISTRATOR"]);
    
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "Pengguna dengan email tersebut tidak ditemukan." };

    // Find webinar by slug
    const webinar = await prisma.webinar.findUnique({ where: { slug: webinarSlug } });
    if (!webinar) return { success: false, error: "Webinar dengan slug tersebut tidak ditemukan." };

    // Check if already exists
    const existing = await prisma.certificate.findUnique({
      where: {
        userId_webinarId: { userId: user.id, webinarId: webinar.id }
      }
    });

    if (existing) {
      return { success: false, error: "Sertifikat untuk pengguna dan webinar ini sudah pernah diterbitkan." };
    }

    // Generate random cert number (e.g. GEO-WEB-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const certificateNumber = `GEO-WEB-${dateStr}-${randomStr}`;

    const cert = await prisma.certificate.create({
      data: {
        userId: user.id,
        webinarId: webinar.id,
        certificateNumber,
        isValid: true
      }
    });

    revalidatePath("/admin/certificates");
    return { success: true, data: cert };
  } catch (error) {
    console.error("CREATE_CERTIFICATE_ERROR:", error);
    return { success: false, error: "Gagal menerbitkan sertifikat." };
  }
}

export async function toggleCertificateStatus(id: string) {
  try {
    await requireRole(["ADMINISTRATOR"]);
    
    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new Error("Sertifikat tidak ditemukan.");

    await prisma.certificate.update({
      where: { id },
      data: { isValid: !cert.isValid }
    });

    revalidatePath("/admin/certificates");
    return { success: true };
  } catch (error) {
    console.error("TOGGLE_CERTIFICATE_ERROR:", error);
    return { success: false, error: "Gagal mengubah status sertifikat." };
  }
}

export async function deleteCertificate(id: string) {
  try {
    await requireRole(["ADMINISTRATOR"]);
    
    await prisma.certificate.delete({ where: { id } });

    revalidatePath("/admin/certificates");
    return { success: true };
  } catch (error) {
    console.error("DELETE_CERTIFICATE_ERROR:", error);
    return { success: false, error: "Gagal menghapus sertifikat." };
  }
}
