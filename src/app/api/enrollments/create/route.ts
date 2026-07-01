import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth"; 
import { processNewOrder } from "@/modules/order/order.service";

/**
 * 🚀 PRESENTATION LAYER (API ROUTE CONTROLLER)
 * Controller murni bertugas menangani HTTP (Request/Response) dan Auth.
 * Logika bisnis dipisah 100% ke layer Service di modules/order/order.service.ts
 */

interface EnrollmentRequestBody {
  webinarId: string;
  addons: string[];
  totalAmount: number;
  paymentChannel: string;
  isGuest: boolean; // Currently unused in core logic but passed from frontend
}

export async function POST(request: Request) {
  try {
    // 1. HTTP Validations & Auth
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Autentikasi diperlukan. Sesi Anda berakhir." }, { status: 401 });
    }

    const body: EnrollmentRequestBody = await request.json();
    if (!body.webinarId) {
      return NextResponse.json({ error: "Parameter 'webinarId' wajib disertakan." }, { status: 400 });
    }

    // 2. Lempar ke Service Layer (Domain Logic)
    const result = await processNewOrder({
      webinarId: body.webinarId,
      addons: body.addons || [],
      totalAmount: body.totalAmount,
      paymentChannel: body.paymentChannel,
      userEmail: session.user.email
    });

    // 3. Return Standardized Response
    return NextResponse.json({
      success: true,
      enrollmentId: result.orderId,
      status: result.status,
      xenditReferenceId: result.xenditReferenceId,
      paymentData: result.paymentData, 
      expiresAt: result.expiresAt
    }, { status: 201 });

  } catch (error) {
    console.error("🚨 CRITICAL_API_ORDER_CREATE_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal memproses pendaftaran.", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}