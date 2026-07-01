// src/actions/captcha.ts
"use server";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * 🔒 Server Action untuk memvalidasi Token Cloudflare Turnstile
 */
export async function validateCaptchaToken(token: string): Promise<boolean> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn("⚠️ Warning: CLOUDFLARE_TURNSTILE_SECRET_KEY tidak terdeteksi di server.");
    return false;
  }

  console.log("=== MEMULAI VALIDASI CAPTCHA ===");
    console.log("Token yang diterima server:", token ? "TERSEDIA (Valid)" : "KOSONG (Eror)");

  try {
    // Membuat payload form data resmi untuk jabat tangan dengan API Cloudflare
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const outcome = (await result.json()) as TurnstileVerifyResponse;
    console.log("Respons langsung dari Cloudflare API:", outcome);
    console.log("=================================");

    return outcome.success;
  } catch (error: unknown) {
    console.error("❌ Gagal memvalidasi token CAPTCHA di server:", error);
    return false;
  }
}