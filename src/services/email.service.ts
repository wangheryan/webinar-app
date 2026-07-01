import { Resend } from "resend";
import { render } from "@react-email/render";

let _resend: Resend | null = null;

function getResendClient(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured in environment variables.");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const DEFAULT_FROM = "Geomining Official <noreply@geomining.id>";

interface UniversalSendProps {
  toEmail: string;
  subject: string;
  template: React.ReactElement;
}

export interface EmailEngineResponse {
  success: boolean;
  id?: string;
  message: string; // Menyediakan pesan ramah pengguna yang siap dirender di UI
  code?: string;   // Kode log telemetri internal untuk tim dev
}

// Interface khusus untuk memetakan struktur error jaringan Node.js (seperti Axios/Fetch/Undici timeout)
interface NetworkError extends Error {
  code?: string;
}

/**
 * 🚀 Core Universal Engine dengan Penanganan Eror yang Humanis & Strict TypeScript
 */
export async function sendUniversalEmail({ toEmail, subject, template }: UniversalSendProps): Promise<EmailEngineResponse> {
  try {
    // 🌟 PERBAIKAN UTAMA: Ditambahkan 'await' karena render dari @react-email/render mengembalikan Promise<string>
    const htmlContent = await render(template);

    const { data, error } = await getResendClient().emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: subject,
      html: htmlContent,
    });

    // ── 🌟 1. PENANGANAN EROR BAWAAN RESEND API (Strict Checked) ──
    if (error) {
      console.error("❌ Resend API Error:", error);

      // Pemetaan kode kesalahan umum Resend agar komunikatif bagi pengguna
      switch (error.name) {
        case "validation_error":
          return {
            success: false,
            message: "Format alamat email tujuan Anda tidak valid atau tidak dikenali oleh sistem.",
            code: "ERR_MAIL_VALIDATION_FAILED",
          };
        case "rate_limit_exceeded":
          return {
            success: false,
            message: "Lalu lintas pengiriman kode keamanan sedang sangat padat. Mohon tunggu 1-2 menit lalu coba kembali.",
            code: "ERR_MAIL_RATE_LIMIT",
          };
        case "daily_quota_exceeded":
          return {
            success: false,
            message: "Sistem pengiriman token harian kami mencapai batas maksimum alokasi. Tim teknis telah dinotifikasi, mohon hubungi admin.",
            code: "ERR_MAIL_QUOTA_DEPLETED",
          };
        default:
          return {
            success: false,
            message: "Gateway email gagal mengirimkan kode verifikasi. Periksa kembali koneksi atau gunakan email lain.",
            code: `ERR_RESEND_${error.name.toUpperCase()}`,
          };
      }
    }

    // Sukses jabat tangan API
    return { 
      success: true, 
      id: data?.id,
      message: "Email berhasil di kirim ke nomor tujuan" 
    };

  } catch (err: unknown) {
    // ── 🌟 2. PERBAIKAN STRIKT ANTI-ANY: Menggunakan Type Guard 'unknown' & 'instanceof' ──
    console.error("❌ Failed to trigger universal Resend service:", err);

    let clientMessage = "Gagal menghubungi server email. Periksa jaringan internet Anda dan coba beberapa saat lagi.";
    let systemCode = "ERR_MAIL_GENERIC_EXCEPTION";

    // Memeriksa secara aman apakah objek eror yang ditangkap merupakan turunan dari class Error bawaan JS/Node
    if (err instanceof Error) {
      const networkErr = err as NetworkError;
      
      // Cek jika terjadi kegagalan jaringan atau batasan waktu (Timeout)
      if (networkErr.code === "UND_ERR_CONNECT_TIMEOUT" || networkErr.message.includes("timeout")) {
        clientMessage = "Koneksi gateway keamanan ke server email terputus (Timeout). Silakan tekan tombol Kirim Ulang Token.";
        systemCode = "ERR_MAIL_GATEWAY_TIMEOUT";
      } else {
        // Menyisipkan pesan internal error ke system code jika diperlukan debugging mendalam
        systemCode = `ERR_MAIL_EXCEPTION_${networkErr.name.toUpperCase()}`;
      }
    }

    return {
      success: false,
      message: clientMessage,
      code: systemCode,
    };
  }
}