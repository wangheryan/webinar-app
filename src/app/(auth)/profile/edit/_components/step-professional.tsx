// edit/_components/step-professional.tsx
"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Building2, ShieldAlert, Award } from "lucide-react";
import { EditProfileInput } from "./types";

interface StepProfessionalProps {
  register: UseFormRegister<EditProfileInput>;
  isPending: boolean;
  watchedStatus: "MAHASISWA" | "PROFESSIONAL" | "GENERAL";
  errors: FieldErrors<EditProfileInput>;
}

export function StepProfessional({ register, isPending, watchedStatus, errors }: StepProfessionalProps) {
  const isProfessional = watchedStatus === "PROFESSIONAL";

  return (
    <div className="space-y-5 shadow-3xs animate-fadeIn">

      {!isProfessional && (
        <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 border border-border rounded-md">
          [INFO]: Bagian pengalaman ini bersifat opsional (bisa dikosongkan/skip).
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* PERUSAHAAN */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Nama Perusahaan</label>
            <span className="text-[10px] italic text-muted-foreground/50">
              <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
            </span>
          </div>
          <div className="relative mt-1">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              {...register("companyName")}
              type="text"
              disabled={isPending}
              className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs font-semibold  focus:outline-none transition-colors ${errors.companyName ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                }`}
              placeholder="e.g. PT Freeport Indonesia"
            />
          </div>
          {errors.companyName?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.companyName.message}</p>
          )}
        </div>

        {/* JABATAN */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Jabatan Utama</label>
            <span className="text-[10px] italic text-muted-foreground/50">
              <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
            </span>
          </div>
          <div className="relative mt-1">
            <ShieldAlert className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              {...register("jobTitle")}
              type="text"
              disabled={isPending}
              className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors ${errors.jobTitle ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                }`}
              placeholder="e.g. Geotechnical Engineer"
            />
          </div>
          {errors.jobTitle?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.jobTitle.message}</p>
          )}
        </div>

        {/* KOMODITAS */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Komoditas Sektor</label>
            <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
          </div>
          <input
            {...register("sector")}
            type="text"
            disabled={isPending}
            className={`w-full h-9 px-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors mt-1 ${errors.sector ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
            placeholder="e.g. Emas / Batubara"
          />
          {errors.sector?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.sector.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* PENGALAMAN TAHUN */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase">Pengalaman (Tahun)</label>
            <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
          </div>
          <input
            {...register("yearsOfExperience")}
            type="number"
            disabled={isPending}
            className={`w-full h-9 px-3 bg-muted/20 border rounded-lg text-xs focus:outline-none transition-colors ${errors.yearsOfExperience ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
              }`}
            placeholder="e.g. 4"
          />
          {errors.yearsOfExperience?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.yearsOfExperience.message}</p>
          )}
        </div>

        {/* LISENSI KCMI */}
        <div className="space-y-1 sm:col-span-2">
          <div className="flex justify-between items-center">
            <label className="text-[10.5px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Award size={12} className="text-primary" /> Nomor Register Lisensi KCMI / CPI
            </label>
            <span className="text-[10px] text-muted-foreground/40 italic lowercase">(opsional)</span>
          </div>
          <div className="relative mt-1">
            <Award className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              {...register("kcmiNumber")}
              type="text"
              disabled={isPending}
              className={`w-full h-9 pl-9 pr-3 bg-muted/20 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${errors.kcmiNumber ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                }`}
              placeholder="CPI-XXXXX / PERHAPI-XXXXX"
            />
          </div>
          {errors.kcmiNumber?.message && (
            <p className="text-[10px] text-destructive font-semibold  px-1 mt-1">⚠️ {errors.kcmiNumber.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}