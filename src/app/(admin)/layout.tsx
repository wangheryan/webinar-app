// src/app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";



const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: "--font-sans",
})

export const metadata = {
  title: "Admin Panel — Geomining.ID",
  description: "Management console for Geomining webinar platform",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMINISTRATOR") {
    redirect("/auth/login");
  }

  return (
    <html lang="id" className={cn(poppins.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AdminShell>{children}</AdminShell>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
