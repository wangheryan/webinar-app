// edit/_components/step-academic.tsx
"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Landmark, BookOpen } from "lucide-react";
import { EditProfileInput } from "./types";

interface StepAcademicProps {
  register: UseFormRegister<EditProfileInput>;
  isPending: boolean;
  watchedStatus: "MAHASISWA" | "PROFESSIONAL" | "GENERAL";
  errors: FieldErrors<EditProfileInput>;
}

export function StepAcademic({ register, isPending, watchedStatus, errors }: StepAcademicProps) {
  const isMahasiswa = watchedStatus === "MAHASISWA";

  return (
    <div className="space-y-5 shadow-3xs animate-fadeIn">

      {!isMahasiswa && (
        <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 border border-border rounded-md">
          [INFO]: Lengkapi untuk profil portofolio anda. langkah ini opsional (bisa dilewati dengan klik selanjutnya/skip).
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Nama Kampus / Institut</label>
            <span className="text-[10px] italic text-muted-foreground/50">
              {isMahasiswa ? <span className="text-destructive font-bold">* wajib</span> : "(Opsional)"}
            </span>
          </div>
          <div className="relative mt-1">
            <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              {...register("institution")}
              type="text"
              disabled={isPending}
              className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs font-semibold  focus:outline-none transition-colors ${errors.institution ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                }`}
              placeholder="e.g. Institut Teknologi Bandung"
            />
          </div>
          {errors.institution?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.institution.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Program Studi / Jurusan</label>
            <span className="text-[10px] italic text-muted-foreground/50">
              {isMahasiswa ? <span className="text-destructive font-bold">* wajib</span> : "(Opsional)"}
            </span>
          </div>
          <div className="relative mt-1">
            <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              {...register("major")}
              type="text"
              disabled={isPending}
              className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors ${errors.major ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                }`}
              placeholder="e.g. Teknik Pertambangan"
            />
          </div>
          {errors.major?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.major.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Semester</label>
            <span className="text-[10px] italic text-muted-foreground/50">
              {isMahasiswa ? <span className="text-destructive font-bold">*</span> : "(Opsi)"}
            </span>
          </div>
          <input
            {...register("semester")}
            type="number"
            disabled={isPending}
            className={`w-full h-9 px-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors ${errors.semester ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
            placeholder="e.g. 6"
          />
          {errors.semester?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.semester.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Tahun Masuk</label>
            <span className="text-[10px] italic text-muted-foreground/50">
              {isMahasiswa ? <span className="text-destructive font-bold">*</span> : "(Opsi)"}
            </span>
          </div>
          <input
            {...register("entryYear")}
            type="number"
            disabled={isPending}
            className={`w-full h-9 px-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors ${errors.entryYear ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
            placeholder="e.g. 2023"
          />
          {errors.entryYear?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.entryYear.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Tahun Lulus</label>
            <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
          </div>
          <input
            {...register("graduationYear")}
            type="number"
            disabled={isPending}
            className={`w-full h-9 px-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors ${errors.graduationYear ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
            placeholder="e.g. 2027"
          />
          {errors.graduationYear?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.graduationYear.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}