import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/enums";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Casting tipe data menggunakan enum strict dari Prisma
    const role = token?.role as UserRole | undefined;
    const isNewUser = token?.isNewUser === true;

    const isAuthPage = path.startsWith("/auth/login") || path.startsWith("/auth/register");
    const isHeadingToOnboarding = path.startsWith("/profile/edit");
    const isProtected = path.startsWith("/profile") || path.startsWith("/dashboard") || path.startsWith("/admin");

    // 1. KONDISI: Akses Halaman Auth ketika sudah login
    if (isAuthPage) {
      const isValidSession = token && token.email && role && token.isActive === true;
      if (isValidSession) {
        const target = isNewUser ? "/profile/edit?status=new_registration" : "/profile";
        return NextResponse.redirect(new URL(target, req.url));
      }
      return NextResponse.next();
    }

    // Hanya terapkan proteksi pada rute yang dilindungi
    if (isProtected) {
      // 2. KONDISI: Proteksi Sesi Global (Belum Login / Sesi Expired)
      if (!token || !token.email || !role || token.isActive !== true) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      // 3. KONDISI: Gerbang Intersepsi Onboarding Pengguna Baru
      if (isNewUser && !isHeadingToOnboarding) {
        return NextResponse.redirect(new URL("/profile/edit?status=new_registration", req.url));
      }

      // Jika user lama (sudah onboarding) tersangkut query parameter pendaftaran baru, bersihkan rutenya
      if (!isNewUser && isHeadingToOnboarding && req.nextUrl.searchParams.get("status") === "new_registration") {
        return NextResponse.redirect(new URL("/profile", req.url));
      }

      // 4. KONDISI: Otorisasi Berdasarkan Hierarki Role
      if (path.startsWith("/admin")) {
        if (role === UserRole.ADMINISTRATOR) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ],
};