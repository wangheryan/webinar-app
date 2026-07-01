// src/components/ui/password-strength-indicator.tsx
"use client";

import { useMemo } from "react";
import { checkPasswordCriteria, getPasswordStrengthScore, getPasswordStrengthLabel } from "@/lib/password";

interface PasswordStrengthIndicatorProps {
  passwordWatched: string;
  confirmPasswordWatched?: string;
}

export function PasswordStrengthIndicator({
  passwordWatched,
  confirmPasswordWatched,
}: PasswordStrengthIndicatorProps) {
  // Gunakan useMemo agar kalkulasi regex tidak memicu re-render liar yang berat
  const criteria = useMemo(() => checkPasswordCriteria(passwordWatched), [passwordWatched]);
  const score = useMemo(() => getPasswordStrengthScore(criteria), [criteria]);
  const label = useMemo(() => getPasswordStrengthLabel(score), [score]);

  if (!passwordWatched || passwordWatched.length === 0) return null;

  return (
    <div className="p-3 bg-slate-100/50 dark:bg-[#121b2d]/40 rounded-lg border border-slate-200/50 dark:border-slate-800/50 space-y-2 text-[11px] animate-fadeIn">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Kekuatan Kata Sandi:</span>
        <span
          className={`font-semibold transition-colors ${score <= 2 ? "text-red-500" : score <= 4 ? "text-amber-500" : "text-emerald-500"
            }`}
        >
          {label}
        </span>
      </div>

      {/* Progress Bar Gauge */}
      <div className="grid grid-cols-5 gap-1.5 h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${score <= 2 ? "bg-red-500" : score <= 4 ? "bg-amber-500" : "bg-emerald-500"
            }`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>

      {/* Checklist Kriteria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium pt-1">
        <div className={`flex items-center gap-1.5 ${criteria.hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
          <span className="text-xs">{criteria.hasMinLength ? "✓" : "○"}</span> Minimal 6 karakter
        </div>
        <div className={`flex items-center gap-1.5 ${criteria.hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
          <span className="text-xs">{criteria.hasUppercase ? "✓" : "○"}</span> Satu huruf besar (A-Z)
        </div>
        <div className={`flex items-center gap-1.5 ${criteria.hasLowercase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
          <span className="text-xs">{criteria.hasLowercase ? "✓" : "○"}</span> Satu huruf kecil (a-z)
        </div>
        <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
          <span className="text-xs">{criteria.hasNumber ? "✓" : "○"}</span> Satu angka (0-9)
        </div>
        <div className={`flex items-center gap-1.5 ${criteria.hasSpecial ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
          <span className="text-xs">{criteria.hasSpecial ? "✓" : "○"}</span> Karakter spesial (@$!%*?&)
        </div>

        {/* Kondisional Pencocokan Konfirmasi Sandi */}
        {confirmPasswordWatched !== undefined && confirmPasswordWatched.length > 0 && (
          <div className={`flex items-center gap-1.5 ${passwordWatched === confirmPasswordWatched ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            <span className="text-xs">{passwordWatched === confirmPasswordWatched ? "✓" : "×"}</span> Konfirmasi cocok
          </div>
        )}
      </div>
    </div>
  );
}