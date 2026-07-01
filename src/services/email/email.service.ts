import { IEmailProvider, UniversalSendProps, EmailEngineResponse } from "./types";
import { ResendProvider } from "./providers/resend.provider";

/**
 * 🚀 EmailService - Context Orchestrator (Strategy Pattern)
 * Memungkinkan pergantian Email Provider tanpa mengubah logika bisnis aplikasi.
 */
class EmailService {
  private provider: IEmailProvider;

  constructor(provider: IEmailProvider) {
    this.provider = provider;
  }

  // Mengubah provider secara dinamis jika diperlukan
  public setProvider(provider: IEmailProvider) {
    this.provider = provider;
  }

  public async sendEmail(props: UniversalSendProps): Promise<EmailEngineResponse> {
    return await this.provider.sendEmail(props);
  }
}

// ── 🌟 INSTANCE DEFAULT ──
// Saat ini default menggunakan Resend, jika besok ingin pakai AWS SES:
// const emailService = new EmailService(new AwsSesProvider());
export const emailService = new EmailService(new ResendProvider());

// Ke-belakang kompatibilitas (bisa di-deprecate nanti setelah semua file bermigrasi)
export const sendUniversalEmail = async (props: UniversalSendProps) => {
  return await emailService.sendEmail(props);
};
