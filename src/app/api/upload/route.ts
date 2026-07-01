import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // 'avatar' atau 'banner'

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (type !== "avatar" && type !== "banner" && type !== "webinar" && type !== "speaker") {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const publicUrl = await uploadToCloudinary(buffer, type);

    // Update database
    const userId = session.user.id;

    if (type === "avatar") {
      await prisma.user.update({
        where: { id: userId },
        data: { image: publicUrl },
      });
    } else if (type === "banner") {
      // Pastikan UserProfile sudah ada
      await prisma.userProfile.upsert({
        where: { userId },
        update: { bannerImage: publicUrl },
        create: {
          userId,
          bannerImage: publicUrl,
        },
      });
    }
    // Jika type === "webinar" atau "speaker", kita hanya mengembalikan publicUrl tanpa mengubah database user.

    let successMessage = "File berhasil diunggah.";
    if (type === "webinar") successMessage = "Gambar webinar berhasil diunggah.";
    else if (type === "speaker") successMessage = "Foto instruktur berhasil diunggah.";
    else if (type === "avatar") successMessage = "Foto profil berhasil diperbarui.";
    else if (type === "banner") successMessage = "Banner berhasil diperbarui.";

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: successMessage
    });
  } catch (error: unknown) {
    console.error("GCS Upload Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
