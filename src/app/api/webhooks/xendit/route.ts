import { NextResponse } from "next/server";
import { processXenditWebhook } from "@/modules/payment/payment.service";
import { revalidatePath } from "next/cache";

/**
 * 🚀 PRESENTATION LAYER (API ROUTE CONTROLLER)
 * Menerima Webhook dari Xendit.
 */

interface XenditPaymentRequestCallback {
  event?: string;
  data?: {
    reference_id?: string;
    status?: string;
    amount?: number;
  };
}

export async function POST(request: Request) {
  try {
    const xenditXToken = request.headers.get("x-callback-token");
    const localWebhookToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (!xenditXToken || xenditXToken !== localWebhookToken) {
      return NextResponse.json({ message: "Unauthorized Verification Token" }, { status: 401 });
    }

    const payload = (await request.json()) as XenditPaymentRequestCallback;
    const externalId = payload.data?.reference_id;
    const paymentStatus = payload.data?.status;

    if (!externalId) {
      return NextResponse.json({ message: "Missing reference_id parameters" }, { status: 400 });
    }

    // Eksekusi core business logic
    const result = await processXenditWebhook(externalId, paymentStatus || "");

    if (result.success && !result.ignored) {
      // Sinkronisasi paksa cache data LMS
      // Hanya dipanggil pada saat terjadi perubahan status (SUCCEEDED)
      revalidatePath("/profile");
      if (result.webinarId) {
        revalidatePath(`/webinars/${result.webinarId}`);
      }
      console.log(`✅ [Payment Request] Webhook Processed Successfully for External ID: ${externalId}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (error: unknown) {
    console.error("❌ XENDIT_WEBHOOK_PAYMENT_REQUEST_ERROR:", error);
    return NextResponse.json({ message: "Internal Webhook Handler Failure" }, { status: 500 });
  }
}