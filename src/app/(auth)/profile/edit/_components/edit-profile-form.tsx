// src/app/profile/edit/_components/edit-profile-form.tsx
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingSchema, OnboardingFormValues } from "@/schemas/profile"; // 🌟 Mengonsumsi Tipe Data Bersih
import { updateProfileActions } from "@/actions/profile";
import { Save, Terminal } from "lucide-react";


import { StepInformation } from "./step-information";
import { StepAcademic } from "./step-academic";
import { StepProfessional } from "./step-professional";
import { UserRole, EmploymentStatus, InfoSource } from "@/generated/prisma/enums";

interface EditProfileFormProps {
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

export function EditProfileForm({ initialUser }: EditProfileFormProps) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);


  const p = initialUser.profile;

  const defaultInfoSource = p?.infoSource || InfoSource.LINKEDIN;
  const defaultStatus = p?.employmentStatus || EmploymentStatus.GENERAL;

  // 🌟 SINKRONISASI TOTAL: Mengunci useForm dengan struktur schema Zod murni
  const { register, handleSubmit, watch, formState: { errors } } = useForm<OnboardingFormValues>({
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

  // compiler mengenali 'status' sebagai string literal murni dari Enum Zod
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedStatus = watch("status");

  const onSubmit = (data: OnboardingFormValues): void => {
    startTransition(async () => {
      const response = await updateProfileActions(initialUser.id, p?.id ?? "", data);

      if (response.success) {
        setFeedback(response);
        if (typeof update === "function") {
          await update();
        }
      } else {
        setFeedback(response);
      }
    });
  };

  return (
    <div className="space-y-6 text-xs antialiased text-foreground">
      {feedback && (
        <div className={`p-3.5 border rounded-xl text-xs flex items-center gap-2 font-medium ${feedback.success
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}>
          <Terminal size={14} /> {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 🌟 BEBAS ANY: Penyerahan props mengalir lancar karena tipe data atas-bawah sudah seragam */}
        <div className="space-y-6">
          <StepInformation register={register} isPending={isPending} errors={errors} />
          <StepAcademic register={register} isPending={isPending} watchedStatus={watchedStatus} errors={errors} />
          <StepProfessional register={register} isPending={isPending} watchedStatus={watchedStatus} errors={errors} />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-border/60">
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 w-full sm:w-auto justify-center active:scale-[0.98]"
          >
            <Save size={14} />
            <span>{isPending ? "savingChanges" : "saveProfile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}