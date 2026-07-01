// src/app/u/[username]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { userService } from "@/services/user.service";
import { constructSEOConfig } from "@/lib/metadata";

import { cache } from "react";

// Import Komponen UI
import { ProfileClientHeader } from "@/components/features/profile/profile-client-header";
import { ProfileSidebar } from "@/components/features/profile/profile-sidebar";
import { ProfileTimeline } from "@/components/features/profile/profile-timeline";
import { ProfileCertificates } from "@/components/features/profile/profile-certificates";

interface PublicProfileProps {
  params: Promise<{ username: string }>;
}

// Wrap service layer call with React cache for request-level memoization
const getCachedProfileDashboardData = cache(async (username: string) => {
  return userService.getProfileDashboardData(username, true);
});

export async function generateMetadata({ params }: PublicProfileProps): Promise<Metadata> {
  const { username } = await params;
  
  const dashboardData = await getCachedProfileDashboardData(username);

  if (!dashboardData) return {};

  const { user } = dashboardData;
  

  const baseJob = "member";
  const baseCompany = "Geocore Portal";

  const { metadata } = constructSEOConfig({
    title: `Profile ${user.name || "profile"} | ${baseJob} at ${baseCompany}`,
    description: `Lihat profil publik dari ${user.name || "Member Geocore"} di platform Geocore.`,
    url: `https://geomining.id/u/${username}`,
    ogImage: user.image || "https://geomining.id/images/geocore-og.png",
    type: "profile"
  });

  return metadata;
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const { username } = await params;
  

  // 🌟 REFAKTOR: Mengambil data ter-cache dari Service Layer (hanya 1 trip DB untuk seluruh request lifecycle)
  const dashboardData = await getCachedProfileDashboardData(username);

  if (!dashboardData) {
    notFound();
  }

  const { user, profile, timelineEnrollments, legacyWebinarHistory, stats, meta } = dashboardData;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 transition-colors duration-200 selection:bg-primary/20 select-none">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.jsonLd) }}
      />

      <ProfileClientHeader 
        initialName={user.name || "geocoreMember"}
        userRole={user.role}
        initialJobTitle={meta.jobTitle}
        initialCompany={meta.companyName}
        initialJoinDate={meta.joinDateFormatted}
        initialEmploymentStatus={profile.employmentStatus}
        username={user.username}
        isPublic={true}
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
          isPublic={true}
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
