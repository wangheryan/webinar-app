import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing enrollment ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        webinar: { select: { title: true } },
        user: { select: { name: true, email: true } },
        selectedAddons: {
          select: {
            addon: { select: { name: true } }
          }
        },
        payments: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const payment = order.payments[0];

    const enrollment = {
      id: order.id,
      totalAmount: order.totalAmount,
      paymentChannel: payment?.paymentChannel,
      paymentData: null,
      xenditReferenceId: payment?.xenditExternalId,
      expiresAt: payment?.expiresAt,
      webinar: order.webinar,
      user: order.user,
      selectedAddons: order.selectedAddons
    };

    return NextResponse.json({ data: enrollment }, { status: 200 });
  } catch (error) {
    console.error("API_ENROLLMENT_DETAIL_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
