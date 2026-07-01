import { findUserWithFullEnrollments } from "@/repositories/user.repository";
import prisma from "@/lib/prisma";
import type { LocalWebinarHistoryItem, EnrollmentTimelineItem } from "@/types/profile";
import { constructSEOConfig } from "@/lib/metadata";

/**
 * 🌟 REFAKTOR: Business Layer untuk Profile Dashboard
 * Memproses raw data dari Prisma menjadi format presentasi yang siap dipakai UI.
 */
export const userService = {
  /**
   * Mengambil data terstruktur untuk dirender di halaman Profil
   * @param identifier ID pengguna (jika auth) atau username (jika public)
   * @param isUsername Apakah identifier berupa username?
   */
  async getProfileDashboardData(identifier: string, isUsername: boolean = false) {
    const user = await findUserWithFullEnrollments(identifier, isUsername);
    if (!user || !user.profile) {
      return null;
    }

    const p = user.profile;
    const userEnrollments = user.orders || [];

    // 1. Konstruksi Timeline Sejarah Kelas
    const timelineEnrollments: EnrollmentTimelineItem[] = userEnrollments.map((e) => ({
      id: e.id,
      status: e.status,
      totalAmount: e.totalAmount,
      createdAt: e.createdAt,
      webinar: {
        title: e.webinar.title,
        category: e.webinar.category,
        duration: e.webinar.duration,
        materialUrl: e.webinar.materialUrl,
        speakers: e.webinar.speakers.map((s) => ({ name: s.name })),
        sessions: e.webinar.sessions.map((s) => ({
          startDate: s.startDate,
          meetingUrl: s.meetingUrl,
          recordingUrl: s.recordingUrl,
        })),
      },
      selectedAddons: e.selectedAddons.map((sa) => ({ addon: { name: sa.addon.name } })),
    }));

    // 2. Akuntansi & Statistik
    const totalHours = userEnrollments
      .filter((e) => e.status === "SUCCESS")
      .reduce((sum, e) => {
        const match = e.webinar.duration.match(/\d+/);
        return sum + (match ? parseInt(match[0], 10) : 0);
      }, 0);

    const completedWebinarsCount = userEnrollments.filter((e) => e.status === "SUCCESS").length;

    // Fetch all certificates once to resolve N+1 query problem and eliminate count query
    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id, isValid: true },
    });
    const totalCertificatesCount = certificates.length;

    // Create a map for O(1) in-memory lookup
    const certMap = new Map(certificates.map((c) => [c.webinarId, c]));

    // 3. Sertifikat & Riwayat Legacy
    const legacyWebinarHistory: LocalWebinarHistoryItem[] = [];

    for (const e of userEnrollments) {
      const cert = certMap.get(e.webinarId);

      const formattedSessionDate = e.webinar.sessions[0]?.startDate
        ? new Date(e.webinar.sessions[0].startDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "TBA";

      legacyWebinarHistory.push({
        id: e.id,
        title: e.webinar.title,
        speaker: e.webinar.speakers.map((s) => s.name).join(", ") || "TBA",
        date: formattedSessionDate,
        hours: parseInt(e.webinar.duration.match(/\d+/)?.[0] || "0", 10),
        tierName: e.totalAmount === 0 ? "Free Access" : "Premium Pass",
        priceType: e.totalAmount === 0 ? "FREE" : "PAID",
        status: e.status === "SUCCESS" ? "COMPLETED" : "UPCOMING",
        hasCertificate: !!cert,
        certificateNumber: cert?.certificateNumber ?? null,
      });
    }

    // 4. Identitas & Meta
    const jobTitle = p.jobTitle || p.major || "Member Geocore";
    const companyName = p.companyName || p.institution || "Umum";
    const joinDateFormatted = new Date(user.createdAt).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

    const socialLinks: string[] = [];
    if (p.linkedinUrl) socialLinks.push(p.linkedinUrl);

    const { jsonLd } = constructSEOConfig({
      siteName: user.name || "Geocore Member",
      url: `https://geomining.id/${isUsername ? "u/" + user.username : "profile"}`,
      description: `Portofolio kompetensi digital ${user.name || "Anggota"} selaku ${jobTitle} di ${companyName}.`,
      ogImage: user.image || "https://geomining.id/images/geocore-og.png",
      graphType: "Person",
      sameAs: socialLinks,
    });

    return {
      user,
      profile: p,
      timelineEnrollments,
      legacyWebinarHistory,
      stats: {
        totalHours,
        completedWebinarsCount,
        totalCertificatesCount,
      },
      meta: {
        jobTitle,
        companyName,
        joinDateFormatted,
        jsonLd,
      },
    };
  },
};
