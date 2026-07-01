// src/components/admin/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Video, Mic2, CreditCard,
  Ticket, ChevronLeft, ChevronRight, Globe, GraduationCap, Award, Mail
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Webinar", href: "/admin/webinars", icon: Video },
  { label: "Instruktur", href: "/admin/instructors", icon: GraduationCap },
  { label: "Pengguna", href: "/admin/users", icon: Users },
  { label: "Transaksi", href: "/admin/enrollments", icon: CreditCard },
  { label: "Sertifikat", href: "/admin/certificates", icon: Award },
  { label: "Kupon", href: "/admin/coupons", icon: Ticket },
  { label: "Perpesanan", href: "/admin/messaging", icon: Mail },
];

interface AdminSidebarInnerProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNavigate?: () => void;
}

export function AdminSidebarInner({ collapsed, setCollapsed, onNavigate }: AdminSidebarInnerProps) {
  const pathname = usePathname();



  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border/60 bg-sidebar/95 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* ── Brand Header ── */}
        <div className={cn(
          "flex items-center h-14 px-4 border-b border-border/40 shrink-0",
          collapsed ? "justify-center" : "gap-2.5"
        )}>
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Globe size={16} className="text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold tracking-widest text-foreground uppercase truncate">
                GEOMINING<span className="text-primary">.ID</span>
              </span>
              <span className="text-[9px] font-medium text-muted-foreground tracking-wide">{"Panel Kendali Utama"}</span>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

            const linkEl = (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold  transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  isActive && "text-primary bg-primary/10 shadow-sm",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive && "text-primary"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 w-[3px] h-6 rounded-r-full bg-primary" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right" className="text-[11px] font-semibold ">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkEl}</div>;
          })}
        </nav>

        {/* ── Collapse Toggle ── */}
        <div className="px-2.5 py-3 border-t border-border/40 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>{"Sembunyikan Menu"}</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
