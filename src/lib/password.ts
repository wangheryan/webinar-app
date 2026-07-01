// src/utils/password.ts

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

/**
 * Fungsi universal untuk mengecek kriteria kekuatan password secara real-time
 */
export function checkPasswordCriteria(password: string): PasswordCriteria {
  return {
    hasMinLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  };
}

/**
 * Fungsi universal untuk menghitung skor kekuatan password (skala 0 - 5)
 */
export function getPasswordStrengthScore(criteria: PasswordCriteria): number {
  return Object.values(criteria).filter(Boolean).length;
}

/**
 * Fungsi universal untuk mendapatkan label teks kekuatan password
 */
export function getPasswordStrengthLabel(score: number): "Lemah" | "Sedang" | "Sangat Kuat" {
  if (score <= 2) return "Lemah";
  if (score <= 4) return "Sedang";
  return "Sangat Kuat";
}