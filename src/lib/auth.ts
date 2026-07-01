// src/lib/auth.ts
// Consolidated auth configuration + helpers (merged from config/auth.config.ts + lib/auth-helper.ts)

import type { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { LoginSchema } from "@/schemas/login";
import { UserRole } from "@/generated/prisma/client";
import { recordLoginAttempt } from "@/actions/auth";

// ── 🔐 NEXTAUTH CONFIGURATION ──

export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              profile: true,
            },
          });

          // 1. JIKA USER TIDAK DITEMUKAN ATAU PASSWORD KOSONG
          if (!user || !user.password) {
            return null;
          }

          // 2. BANDINGKAN PASSWORD MENGGUNAKAN BCRYPT
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            await recordLoginAttempt(email, false);
            return null;
          }

          // 3. PERIKSA APAKAH AKUN SUDAH AKTIF
          if (!user.isActive) {
            await recordLoginAttempt(email, false);
            return null;
          }

          // 4. OTENTIKASI SUKSES: Reset kembali angka kegagalan loginAttempts menjadi 0
          await recordLoginAttempt(email, true);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role as UserRole,
            isActive: user.isActive,
            whatsapp: user.profile?.whatsapp ?? null,
            isNewUser: !user.profile?.whatsapp,
          };

        } catch (error: unknown) {
          console.error("❌ Terjadi kesalahan internal pada siklus authorize NextAuth:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email ?? "" },
          });

          if (dbUser && dbUser.isActive === false) {
            return "/auth/error?error=OAuthAccountDisabled";
          }
        } catch (error: unknown) {
          console.error("❌ Gagal memvalidasi status OAuth user di database:", error);
          return false;
        }
      }
      return true;
    },
    
    // ── 1. JWT CALLBACK ──
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // Jika login via OAuth (misal Google), user object hanya dari provider
        if (account?.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { profile: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isActive = dbUser.isActive;
            token.whatsapp = dbUser.profile?.whatsapp ?? null;
            token.isNewUser = !dbUser.profile?.whatsapp;
          }
        } else {
          // Jika login via Credentials, user object sudah dari DB (termasuk isNewUser)
          token.id = user.id;
          token.role = user.role;
          token.isActive = user.isActive;
          token.whatsapp = user.whatsapp;
          token.isNewUser = user.isNewUser;
        }
      }
      
      if (trigger === "update" && session && typeof session === "object") {
        return { ...token, ...session };
      }
      
      return token;
    },

    // ── 2. SESSION CALLBACK ──
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isActive = token.isActive as boolean;
        session.user.name = token.name;
        session.user.whatsapp = token.whatsapp as string | null;
        session.user.isNewUser = token.isNewUser as boolean;
      }
      return session;
    },

    // ── 3. REDIRECT CALLBACK ──
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  }
};

// ── 🛡️ SESSION HELPERS (from auth-helper.ts) ──

export async function getSession() {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Guard Terpusat: Membatasi hak akses resource backend
 * ADMINISTRATOR otomatis bypass lolos semua pengecekan
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) throw new Error("UNAUTHENTICATED");
  if (!user.isActive) throw new Error("ACCOUNT_DISABLED");
  if (user.role === "ADMINISTRATOR") return user;

  if (!allowedRoles.includes(user.role)) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
