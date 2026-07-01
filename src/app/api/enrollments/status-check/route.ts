import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing enrollment ID" }, { status: 400 });
    }

    const enrollment = await prisma.order.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    return NextResponse.json({ status: enrollment.status }, { status: 200 });
  } catch (error) {
    console.error("API_ENROLLMENT_STATUS_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
