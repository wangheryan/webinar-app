import { Resend } from "resend";
import { render } from "@react-email/render";
import { IEmailProvider, UniversalSendProps, EmailEngineResponse } from "../types";

// Interface khusus untuk memetakan struktur error jaringan Node.js (seperti Axios/Fetch/Undici timeout)
interface NetworkError extends Error {
  code?: string;
}

const DEFAULT_FROM = "Geomining Official <noreply@geomining.id>";

export class ResendProvider implements IEmailProvider {
  private resendClient: Resend | null = null;

  private getClient(): Resend {
    if (!this.resendClient) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured in environment variables.");
      }
      this.resendClient = new Resend(apiKey);
    }
    return this.resendClient;
  }

  async sendEmail(props: UniversalSendProps): Promise<EmailEngineResponse> {
    try {
      let htmlContent = props.html;
      if (props.template) {
        htmlContent = await render(props.template);
      }

      if (!htmlContent && !props.text) {
        throw new Error("Either template, html, or text must be provided.");
      }

      const toArray = Array.isArray(props.toEmail) ? props.toEmail : [props.toEmail];

      const payload: any = {
        from: DEFAULT_FROM,
        to: toArray,
        subject: props.subject,
      };

      if (htmlContent) {
        payload.html = htmlContent;
      } else if (props.text) {
        payload.text = props.text;
      }

      const { data, error } = await this.getClient().emails.send(payload);

      // ── 🌟 PENANGANAN EROR BAWAAN RESEND API ──
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
              message: "Lalu lintas pengiriman email sedang sangat padat. Mohon tunggu 1-2 menit lalu coba kembali.",
              code: "ERR_MAIL_RATE_LIMIT",
            };
          case "daily_quota_exceeded":
            return {
              success: false,
              message: "Sistem pengiriman harian kami mencapai batas maksimum alokasi. Tim teknis telah dinotifikasi, mohon hubungi admin.",
              code: "ERR_MAIL_QUOTA_DEPLETED",
            };
          default:
            return {
              success: false,
              message: "Gateway email gagal mengirimkan pesan. Periksa kembali koneksi atau gunakan email lain.",
              code: `ERR_RESEND_${error.name.toUpperCase()}`,
            };
        }
      }

      // Sukses jabat tangan API
      return { 
        success: true, 
        id: data?.id,
        message: "Email berhasil dikirim ke tujuan" 
      };

    } catch (err: unknown) {
      console.error("❌ Failed to trigger Resend service:", err);

      let clientMessage = "Gagal menghubungi server email. Periksa jaringan internet Anda dan coba beberapa saat lagi.";
      let systemCode = "ERR_MAIL_GENERIC_EXCEPTION";

      if (err instanceof Error) {
        const networkErr = err as NetworkError;
        if (networkErr.code === "UND_ERR_CONNECT_TIMEOUT" || networkErr.message.includes("timeout")) {
          clientMessage = "Koneksi gateway keamanan ke server email terputus (Timeout). Silakan tekan tombol Kirim Ulang.";
          systemCode = "ERR_MAIL_GATEWAY_TIMEOUT";
        } else {
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
}
