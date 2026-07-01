// src/lib/format.ts

/**
 * Format angka menjadi mata uang Rupiah Indonesia.
 * @example formatCurrency(150000) → "Rp150.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string menjadi format tanggal Indonesia pendek.
 * @example formatDateShor"2026-06-28T10:00:00Z" → "28 Jun 2026"
 */
export function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format ISO date string menjadi format tanggal + waktu Indonesia.
 * @example formatDateTime("2026-06-28T10:00:00Z") → "28 Jun 2026, 10:00"
 */
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
