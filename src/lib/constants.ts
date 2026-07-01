// src/lib/constants.ts
// App-wide constants — single source of truth for configuration values

export const SITE_NAME = "Geocore";
export const SITE_DESCRIPTION = "Platform digital terpadu untuk penjenjangan karir, manajemen portofolio kompetensi, dan pengesahan lisensi resmi KCMI/CPI bagi praktisi pertambangan Indonesia.";
export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://geomining.id";

export const DEFAULT_FROM_EMAIL = "Geomining Official <noreply@geomining.id>";

export const OTP_EXPIRY_MINUTES = 15;
export const OTP_LENGTH = 6;

export const MAX_LOGIN_ATTEMPTS = 5;

export const PAYMENT_EXPIRY_MINUTES = 60;

export const DB_POOL_SIZE = 20;
export const DB_IDLE_TIMEOUT_MS = 30000;
export const DB_CONNECTION_TIMEOUT_MS = 10000;
