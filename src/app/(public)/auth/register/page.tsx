// src/app/(auth)/register/page.tsx
import { RegisterForm } from "./register-form";
import Image from "next/image";
import { constructSEOConfig } from "@/lib/metadata";

const seo = constructSEOConfig({
  title: "Pendaftaran Akun Baru",
  description: "Daftarkan diri Anda di Geomining untuk mengikuti webinar eksklusif dan program sertifikasi kompetensi industri pertambangan.",
  keywords: "daftar akun geomining, buat akun webinar tambang, sertifikasi ahli geologi",
});

export const metadata = seo.metadata;
export const viewport = seo.viewport;

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-[#090d16] overflow-x-hidden transition-colors duration-300">
      
      {/* SEAMLESS BACKROUND IMAGE LAYER */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none dark:mix-blend-luminosity">
        <Image
          src="/assets/screen.png"
          alt="LMS Background Texture"
          fill
          priority
          className="object-cover opacity-35 dark:opacity-20 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-950/50" />
      </div>

      {/* Mesh Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] rounded-full bg-indigo-500/10 dark:bg-purple-600/5 blur-[120px] pointer-events-none z-0" />

      {/* Modular Unified Form Card */}
      <RegisterForm />
    </div>
  );
}