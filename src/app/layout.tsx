import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: "--font-sans",
})

export default async function RootLayout({ 
  children
}: { 
  children: React.ReactNode;
}) {

  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth">
      <body className={`${poppins.variable} font-sans antialiased tracking-[0.015em] bg-background text-foreground transition-colors duration-300 animate-in fade-in`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              {children}
              <Toaster position="top-center" richColors />
            </AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}