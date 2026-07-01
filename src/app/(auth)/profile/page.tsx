// src/app/profile/page.tsx
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { constructSEOConfig } from "@/lib/metadata";
import { userService } from "@/services/user.service";
import { cache } from "react";

// Import Komponen UI
import { ProfileClientHeader } from "@/components/features/profile/profile-client-header";
import { ProfileSidebar } from "@/components/features/profile/profile-sidebar";
import { ProfileTimeline } from "@/components/features/profile/profile-timeline";
import { ProfileCertificates } from "@/components/features/profile/profile-certificates";

// Wrap service layer call with React cache for request-level memoization
const getCachedProfileDashboardData = cache(async (id: string) => {
  return userService.getProfileDashboardData(id, false);
});

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return {};

  const dashboardData = await getCachedProfileDashboardData(session.user.id);
  if (!dashboardData) return {};

  const { user, meta } = dashboardData;

  const { metadata } = constructSEOConfig({
    title: `Profile ${user.name || "Profil"} | ${meta.jobTitle} at ${meta.companyName}`,
    description: `Portofolio dan rekam kualifikasi kompetensi profesional serta akademis terverifikasi atas nama ${user.name || "Anggota Geocore"}.`,
    url: `https://geomining.id/profile`,
    ogImage: user.image || "https://geomining.id/images/geocore-og.png",
    type: "profile"
  });

  return metadata;
}

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 🌟 REFAKTOR: Mengambil data ter-cache dari Service Layer
  const dashboardData = await getCachedProfileDashboardData(session.user.id);

  if (!dashboardData) {
    redirect("/profile/edit?status=new_registration");
  }

  const { user, profile, timelineEnrollments, legacyWebinarHistory, stats, meta } = dashboardData;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 transition-colors duration-200 selection:bg-primary/20 select-none">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.jsonLd) }}
      />

      <ProfileClientHeader 
        initialName={user.name || "Anggota Geocore"}
        userRole={user.role}
        initialJobTitle={meta.jobTitle}
        initialCompany={meta.companyName}
        initialJoinDate={meta.joinDateFormatted}
        initialEmploymentStatus={profile.employmentStatus}
        username={user.username}
        isPublic={false}
        initialAvatar={user.image}
        initialBanner={profile.bannerImage}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <ProfileSidebar 
          email={user.email}
          whatsapp={profile.whatsapp}
          linkedinUrl={profile.linkedinUrl}
          totalWebinars={stats.completedWebinarsCount}
          totalHours={stats.totalHours}
          totalCertificates={stats.totalCertificatesCount}
          isPublic={false}
          userRole={user.role} 
          academicProfile={{
            institution: profile.institution || "",
            major: profile.major || "",
            entryYear: profile.entryYear,
            semester: profile.semester,
            graduationYear: profile.graduationYear
          }}
          professionalProfile={{
            companyName: profile.companyName || "",
            jobTitle: profile.jobTitle || "",
            sector: profile.sector,
            kcmiNumber: profile.kcmiNumber,
            yearsOfExperience: profile.yearsOfExperience
          }}
        />

        <ProfileTimeline enrollments={timelineEnrollments} />
        <ProfileCertificates webinarHistory={legacyWebinarHistory} />

      </div>
    </div>
  );
}