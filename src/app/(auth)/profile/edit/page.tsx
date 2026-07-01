// src/app/profile/edit/page.tsx
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { EditProfileForm } from "./_components/edit-profile-form";
import { OnboardingForm } from "./_components/onboarding-form";
import { Metadata } from "next";
import { cache } from "react";
import { constructSEOConfig } from "@/lib/metadata";


interface EditProfilePageProps {
  searchParams: Promise<{ status?: string;[key: string]: string | string[] | undefined }>;
}

// 🏢 OPTIMASI CORE: Memoization murni untuk memotong siklus double-query
const getUserData = cache(async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      profile: {
        select: {
          id: true,
          whatsapp: true,
          linkedinUrl: true,
          employmentStatus: true,
          infoSource: true,
          institution: true,
          major: true,
          entryYear: true,
          semester: true,
          graduationYear: true,
          companyName: true,
          jobTitle: true,
          sector: true,
          kcmiNumber: true,
          yearsOfExperience: true,
        }
      }
    }
  });
});

// 🏢 GENERATE METADATA
export async function generateMetadata({ searchParams }: EditProfilePageProps): Promise<Metadata> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    const { metadata } = constructSEOConfig({ title: "Edit Profil" });
    return metadata;
  }


  const user = await getUserData(session.user.id);
  const params = await searchParams;
  const isNewRegistration = params.status === "new_registration";

  const rawTitle = isNewRegistration
    ? "Lengkapi Profil Anda"
    : `Edit Profil: ${user?.name || "Member"}`;

  const { metadata } = constructSEOConfig({
    title: rawTitle,
    description: "Pembaruan profil dan portofolio karir",
    type: "profile",
    appendSuffix: true
  });

  return metadata;
}

// 🏢 MAIN SERVER COMPONENT
export default async function EditProfilePage({ searchParams }: EditProfilePageProps) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }



  const params = await searchParams;
  const isNewRegistration = params.status === "new_registration";

  const user = await getUserData(session.user.id);

  if (!user) {
    redirect("/auth/login");
  }

  // 🌟 PERBAIKAN RADIKAL: Petakan objek data murni (Plain JavaScript Object) sebelum dilempar ke client component.
  // Cara ini memaksa Next.js memutus total segala metadata tersembunyi/instance class milik engine Prisma backend.
  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role as "ADMINISTRATOR" | "PARTICIPANT",
    profile: user.profile ? {
      id: user.profile.id,
      whatsapp: user.profile.whatsapp,
      linkedinUrl: user.profile.linkedinUrl,
      employmentStatus: user.profile.employmentStatus as "MAHASISWA" | "PROFESSIONAL" | "GENERAL",
      infoSource: user.profile.infoSource as "LINKEDIN" | "SOCIAL_MEDIA" | "ADS" | "MARKETING" | null,
      institution: user.profile.institution,
      major: user.profile.major,
      entryYear: user.profile.entryYear,
      semester: user.profile.semester,
      graduationYear: user.profile.graduationYear,
      companyName: user.profile.companyName,
      jobTitle: user.profile.jobTitle,
      sector: user.profile.sector,
      kcmiNumber: user.profile.kcmiNumber,
      yearsOfExperience: user.profile.yearsOfExperience,
    } : null
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-6 sm:py-10 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 select-none antialiased text-xs">
      <div className="max-w-5xl mx-auto">

        {/* BANNER NOTIFIKASI REGISTRASI BARU */}
        {isNewRegistration && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-500 dark:text-amber-400 animate-fadeIn">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1">
              <p className="leading-relaxed text-muted-foreground font-sans font-medium">
                Berhasil Masuk via Google. Harap lengkapi profil di bawah ini.
              </p>
            </div>
          </div>
        )}

        {/* HEADER PAGE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
              {isNewRegistration ? "Lengkapi Profil Anda" : "Edit Profil"}
            </h1>
          </div>

          {!isNewRegistration && (
            <Link
              href="/profile"
              className="h-8 px-3 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-3xs"
            >
              <ArrowLeft size={12} /> Kembali ke Profil Utama
            </Link>
          )}
        </div>

        {/* ── DISTRIBUTION CONTROLLER ENGINE ── */}
        {isNewRegistration ? (
          <OnboardingForm initialUser={serializedUser} />
        ) : (
          <EditProfileForm initialUser={serializedUser} />
        )}

      </div>
    </main>
  );
}