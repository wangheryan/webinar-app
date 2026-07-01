// src/components/admin/topbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import {
  Sun, Moon, ExternalLink, LogOut, ChevronRight, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";


const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Pengguna",
  "/admin/webinars": "Webinar",
  "/admin/speakers": "Pembicara",
  "/admin/enrollments": "Transaksi",
  "/admin/coupons": "Kupon",
};

/**
 * Resolves breadcrumb label by trying exact match first,
 * then falling back to longest prefix match for subpaths
 * like `/admin/webinars/abc123/participants`.
 */
function resolveBreadcrumb(pathname: string, map: Record<string, string>, defaultLabel: string): string {
  // Exact match
  if (map[pathname]) return map[pathname];

  // Longest prefix match
  let bestMatch = "";
  let bestLabel = defaultLabel;
  for (const [path, label] of Object.entries(map)) {
    if (pathname.startsWith(path) && path.length > bestMatch.length) {
      bestMatch = path;
      bestLabel = label;
    }
  }
  return bestLabel;
}

interface AdminTopbarProps {
  onToggleMobile?: () => void;
}

export function AdminTopbar({ onToggleMobile }: AdminTopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();


  const currentPage = resolveBreadcrumb(pathname, breadcrumbMap, "Panel Admin");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px]">
        {/* Mobile hamburger menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobile}
          className="h-8 w-8 lg:hidden cursor-pointer"
        >
          <Menu size={18} />
        </Button>

        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          {"Administrator"}
        </Link>
        <ChevronRight size={12} className="text-muted-foreground/50" />
        <span className="font-semibold  text-foreground">{currentPage}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Visit site */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Link href="/" target="_blank">
            <ExternalLink size={13} />
            <span className="hidden sm:inline">{"Lihat Situs Utama"}</span>
          </Link>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </Button>

        {/* User Info + Logout */}
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border/50">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-semibold  text-foreground truncate max-w-[120px]">
              {session?.user?.name || "admin"}
            </span>
            <span className="text-[9.5px] text-muted-foreground">{"Akses Administrator Pusat"}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-primary/10 overflow-hidden shrink-0">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="Admin avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] font-semibold text-primary">
                {(session?.user?.name || "A").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="h-8 w-8 text-muted-foreground hover:text-rose-500 cursor-pointer"
          >
            <LogOut size={14} />
          </Button>
        </div>
      </div>
    </header>
  );
}
