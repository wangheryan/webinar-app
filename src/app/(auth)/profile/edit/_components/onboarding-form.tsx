// src/app/profile/edit/_components/onboarding-form.tsx
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingSchema, OnboardingFormValues } from "@/schemas/profile"; // 🌟 BARU: Konsumsi tipe murni dari schema Zod
import { updateProfileActions } from "@/actions/profile";
import {
  ChevronRight, ChevronLeft, Save, Terminal, FastForward,
  User, GraduationCap, Briefcase, CheckCircle2, Sparkles
} from "lucide-react";


import { StepInformation } from "./step-information";
import { StepAcademic } from "./step-academic";
import { StepProfessional } from "./step-professional";
import { UserRole, EmploymentStatus, InfoSource } from "@/generated/prisma/enums";

interface OnboardingFormProps {
  initialUser: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    role: UserRole;
    profile: {
      id: string;
      whatsapp: string | null;
      linkedinUrl: string | null;
      employmentStatus: EmploymentStatus;
      infoSource: InfoSource | null;
      institution: string | null;
      major: string | null;
      entryYear: number | null;
      semester: number | null;
      graduationYear: number | null;
      companyName: string | null;
      jobTitle: string | null;
      sector: string | null;
      kcmiNumber: string | null;
      yearsOfExperience: number | null;
    } | null;
  };
}

export function OnboardingForm({ initialUser }: OnboardingFormProps) {
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);


  const p = initialUser.profile;

  const defaultInfoSource = p?.infoSource || InfoSource.LINKEDIN;
  const defaultStatus = p?.employmentStatus || EmploymentStatus.GENERAL;

  // 🌟 PERBAIKAN CORE: Generisir useForm murni menggunakan OnboardingFormValues (Anti-Any)
  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<OnboardingFormValues>({
    resolver: zodResolver(OnboardingSchema),
    mode: "onChange",
    defaultValues: {
      username: initialUser.username ?? ")",
      name: initialUser.name ?? "",
      email: initialUser.email ?? "",
      password: "",
      whatsapp: p?.whatsapp ?? "",
      linkedinUrl: p?.linkedinUrl ?? "",
      infoSource: defaultInfoSource,
      status: defaultStatus,
      institution: p?.institution ?? "",
      major: p?.major ?? "",
      semester: p?.semester?.toString() ?? "",
      entryYear: p?.entryYear?.toString() ?? "",
      graduationYear: p?.graduationYear?.toString() ?? "",
      companyName: p?.companyName ?? "",
      jobTitle: p?.jobTitle ?? "",
      sector: p?.sector ?? "",
      kcmiNumber: p?.kcmiNumber ?? "",
      yearsOfExperience: p?.yearsOfExperience?.toString() ?? "",
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedStatus = watch("status");

  const handleNextStep = async (): Promise<void> => {
    let fieldsToValidate: (keyof OnboardingFormValues)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["username", "name", "email", "whatsapp"];
    } else if (currentStep === 2 && watchedStatus === "MAHASISWA") {
      fieldsToValidate = ["institution", "major", "semester", "entryYear"];
    }

    if (fieldsToValidate.length > 0) {
      const isStepValid = await trigger(fieldsToValidate);
      if (!isStepValid) return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleSkipStep = async (): Promise<void> => {
    if (currentStep === 2) {
      setValue("institution", "");
      setValue("major", "");
      setValue("semester", "");
      setValue("entryYear", "");
      setValue("graduationYear", "");
      setCurrentStep(3);
    } else if (currentStep === 3) {
      await handleSubmit(onSubmit)();
    }
  };

  const handlePrevStep = (): void => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data: OnboardingFormValues): void => {
    setFeedback(null);
    startTransition(async () => {
      const response = await updateProfileActions(initialUser.id, p?.id ?? "", data);
      if (response.success) {
        if (typeof update === "function") {
          await update({ isNewUser: false, whatsapp: data.whatsapp, name: data.name });
        }
        window.location.href = "/profile";
      } else {
        setFeedback(response);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start text-xs antialiased text-foreground">

      {/* ── SEKTOR KIRI: SIDEBAR MONITOR NAVIGATION (4 COLS) ── */}
      <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-3xs">
          <span className="text-[10px] font-semibold tracking-widest text-primary uppercase block">
            Progres Kelengkapan Profil
          </span>

          <div className="space-y-3.5 relative">
            {/* STEP 1 */}
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold transition-all border shrink-0 ${currentStep > 1
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : currentStep === 1
                  ? "bg-primary border-primary text-primary-foreground shadow-2xs scale-105"
                  : "bg-muted/40 border-border text-muted-foreground"
                }`}>
                {currentStep > 1 ? <CheckCircle2 size={14} /> : "1"}
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-semibold transition-colors ${currentStep === 1 ? "text-foreground" : "text-muted-foreground"}`}>Data Diri Pribadi</p>
                <p className="text-[10px] text-muted-foreground/70 leading-none">Lengkapi informasi dasar Anda</p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold transition-all border shrink-0 ${currentStep > 2
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : currentStep === 2
                  ? "bg-primary border-primary text-primary-foreground shadow-2xs scale-105"
                  : "bg-muted/40 border-border text-muted-foreground"
                }`}>
                {currentStep > 2 ? <CheckCircle2 size={14} /> : "2"}
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-semibold transition-colors ${currentStep === 2 ? "text-foreground" : "text-muted-foreground"}`}>Keahlian & Karir</p>
                <p className="text-[10px] text-muted-foreground/70 leading-none">Informasi profesional Anda</p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold transition-all border shrink-0 ${currentStep === 3
                ? "bg-primary border-primary text-primary-foreground shadow-2xs scale-105"
                : "bg-muted/40 border-border text-muted-foreground"
                }`}>
                3
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-semibold transition-colors ${currentStep === 3 ? "text-foreground" : "text-muted-foreground"}`}>Preferensi Keamanan</p>
                <p className="text-[10px] text-muted-foreground/70 leading-none">Kata sandi & perlindungan akun</p>
              </div>
            </div>
          </div>
        </div>

        {/* TIPS DINAMIS BERBASIS CONTEXT TAHAPAN */}
        <div className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border border-primary/10 rounded-2xl p-4 space-y-2.5 shadow-3xs hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles size={13} /> Informasi ini membantu kami merekomendasikan kurikulum spesifik untuk Anda.
          </div>
          {currentStep === 1 && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">Pastikan nama Anda sesuai dengan sertifikat yang ingin diterbitkan nantinya.</p>
          )}
          {currentStep === 2 && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">Data perusahaan membantu kami menyediakan studi kasus yang lebih relevan untuk Anda.</p>
          )}
          {currentStep === 3 && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">Pilih tingkat privasi profil yang sesuai dengan kenyamanan Anda di platform ini.</p>
          )}
        </div>
      </div>

      {/* ── SEKTOR KANAN: CORE FORM STEPPER (8 COLS) ── */}
      <div className="lg:col-span-8 space-y-5">

        {feedback && (
          <div className="p-3.5 border rounded-xl text-xs bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-2 animate-fadeIn font-medium">
            <Terminal size={14} className="shrink-0" /> {feedback.message}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-1.5 sm:p-2 shadow-3xs">
          <div className="space-y-6 p-2 sm:p-4">

            <div className="transition-all duration-300">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2.5 mb-1">
                    <User size={16} className="text-primary" />
                    <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase">Detail Personal</h2>
                  </div>
                  <StepInformation register={register} isPending={isPending} errors={errors} />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2.5 mb-1">
                    <GraduationCap size={17} className="text-primary" />
                    <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase">Latar Belakang Karir</h2>
                  </div>
                  <StepAcademic register={register} isPending={isPending} watchedStatus={watchedStatus} errors={errors} />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2.5 mb-1">
                    <Briefcase size={16} className="text-primary" />
                    <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase">Keamanan Akun</h2>
                  </div>
                  <StepProfessional register={register} isPending={isPending} watchedStatus={watchedStatus} errors={errors} />
                </div>
              )}
            </div>

            {/* ── FOOTER NAVIGATION BAR CONTROLLER ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t border-border/50 mt-4">

              {/* Sisi Kiri: Tombol Back */}
              <div className="min-h-[36px]">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isPending}
                    className="h-9 px-4 bg-muted/40 hover:bg-muted border border-border text-xs font-semibold rounded-xl transition-all text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto shadow-3xs"
                  >
                    <ChevronLeft size={14} /> Kembali
                  </button>
                )}
              </div>

              {/* Sisi Kanan: Kombinasi Skip & Next / Submit */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleSkipStep}
                    disabled={isPending}
                    className="h-9 px-4 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs active:scale-[0.98]"
                  >
                    <FastForward size={13} />
                    <span>Lewati Langkah Ini</span>
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs w-full sm:w-auto active:scale-[0.98]"
                  >
                    <span>Simpan & Lanjutkan</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isPending}
                    className="h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs disabled:opacity-50 w-full sm:w-auto active:scale-[0.98]"
                  >
                    <Save size={13} />
                    <span>{isPending ? "synchronizing" : "done"}</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}