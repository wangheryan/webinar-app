"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  Sun,
  Moon,
  CreditCard,
  Menu,
  X,
  ArrowRight,
  User,
  Home,
  MonitorPlay,
  Users,
} from "lucide-react";
import { ExpandableTabs, type TabItem } from "@/components/ui/expandable-tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


// ── 🌟 SUB-COMPONENT 1: LOGO GEOMINING.ID ──
const BrandLogo = () => (
  <Link href="/" className="flex items-center gap-2.5 group select-none shrink-0 z-50">
    <div className="w-8 h-8 relative shrink-0 overflow-hidden bg-gradient-to-tr from-primary to-blue-500 rounded-[10px] p-[1.5px] shadow-sm">
      <div className="w-full h-full bg-background rounded-[8.5px] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Geomining ID Logo"
          className="w-4 h-4 object-contain object-center group-hover:scale-110 transition-transform duration-500"
        />
      </div>
    </div>
    <span className="text-[15px] font-extrabold tracking-[0.15em] text-foreground uppercase">
      GEOMINING<span className="text-primary">.ID</span>
    </span>
  </Link>
);

// ── SUB-COMPONENT 2: AVATAR DROPDOWN ──
interface UserAvatarMenuProps {
  userName: string;
  userEmail: string;
  userImage: string | null;
}

const UserAvatarMenu = ({ userName, userEmail, userImage }: UserAvatarMenuProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme;

  const handleThemeToggle = (e: Event) => {
    e.preventDefault();
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async (e: Event) => {
    e.preventDefault();
    await signOut({ callbackUrl: "/auth/login", redirect: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full backdrop-blur-md hover:bg-muted/50 transition-all outline-none cursor-pointer group shadow-sm shrink-0">
          <div className="w-9 h-9 rounded-full bg-muted shrink-0 overflow-hidden shadow-inner transition-all">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-500 text-primary-foreground">
                <User size={16} />
              </div>
            )}
          </div>
          <span className="text-[14px] font-semibold  text-foreground group-hover:text-primary hidden md:block tracking-wide transition-colors">
            {userName.split(" ")[0]}
          </span>
          <ChevronDown size={16} className="text-muted-foreground group-hover:text-foreground transition-transform duration-300 hidden md:block group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 mt-2 p-1.5 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="px-2 py-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden ring-1 ring-border">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-500 text-primary-foreground">
                <User size={16} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0 overflow-hidden">
            <span className="text-[13px] font-semibold text-foreground truncate">{userName}</span>
            <span className="text-[11px] font-medium text-muted-foreground truncate">{userEmail}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border my-1" />

        <DropdownMenuGroup className="p-0.5">
          <DropdownMenuItem asChild className="text-[12px] font-semibold  gap-2.5 py-1 px-2.5 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
            <Link href="/profile">
              <LayoutDashboard size={14} />
              <span>Dashboard Portal</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[12px] font-semibold  gap-2.5 py-1 px-2.5 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
            <CreditCard size={14} />
            <span>Billing & Invoice</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[12px] font-semibold  gap-2.5 py-1 px-2.5 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
            <Settings size={14} />
            <span>Account Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border my-1" />

        <div className="p-0.5">
          <DropdownMenuItem
            onSelect={handleThemeToggle}
            className="text-[12px] font-semibold  gap-2.5 py-1 px-2.5 rounded-lg cursor-pointer focus:bg-muted transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              {mounted ? (currentTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />) : <Sun size={14} />}
              <span>{mounted ? (currentTheme === "dark" ? "Light Mode" : "Dark Mode") : "Theme"}</span>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-border my-1" />

        <div className="p-0.5">
          <DropdownMenuItem
            onSelect={handleLogout}
            className="text-[12px] font-semibold gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── 3. MAIN NAVBAR COMPONENT ──
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const currentTheme = resolvedTheme || theme;

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const tabItems: TabItem[] = [
    { title: "Beranda", icon: Home, href: "/" },
    { title: "Webinars", icon: MonitorPlay, href: "/webinars" },
    { title: "Instruktur", icon: Users, href: "/speaker" },
  ];



  if (status === "loading") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-background/50 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl h-full mx-auto px-6 flex justify-between items-center">
          <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
        </div>
      </nav>
    );
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none pt-4 px-4 sm:px-6 md:pt-6 flex justify-center">
        {/* RESPONSIVE NAVBAR */}
        <nav
          className={cn(
            "flex pointer-events-auto transition-all duration-500 ease-out items-center justify-between",
            "bg-background/80 backdrop-blur-2xl shadow-lg dark:shadow-xl shadow-black/5 border border-border/40",
            "rounded-full p-2 w-full lg:w-fit text-[14px]"
          )}
        >
          {/* 1. KIRI: LOGO (Lebar tetap di Desktop agar seimbang) */}
          <div className="flex lg:w-[260px] justify-start items-center shrink-0">
            <Link href="/" className="pl-3 pr-2 flex items-center group/logo hover:opacity-80 transition-opacity shrink-0">
              <div className="h-9 relative shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-light.png" alt="Geomining ID" className="h-9 object-contain group-hover/logo:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden lg:block w-px bg-border/40 h-[24px] mx-1 shrink-0" />

          {/* 2. TENGAH: TABS (Berada persis di tengah Pill) */}
          <div className="hidden lg:flex items-center shrink-0 px-2 gap-1.5">
            {tabItems.map((tab) => {
              if (tab.type === "separator") return null;
              const isActive = pathname && tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href as string);
              return (
                <Link
                  key={tab.title}
                  href={tab.href as string}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold  transition-all duration-300",
                    isActive ? "bg-muted text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <tab.icon size={18} />
                  <span className="font-semibold tracking-wide">{tab.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:block w-px bg-border/40 h-[24px] mx-1 shrink-0" />

          {/* 3. KANAN: AUTH & MOBILE MENU (Lebar tetap di Desktop agar seimbang dengan logo) */}
          <div className="flex lg:w-[260px] justify-end items-center gap-2 pr-1 shrink-0">
            {/* AUTH SECTION */}
            <ul className="flex items-center shrink-0">
              <li className="flex items-center">
                {isLoggedIn && session?.user ? (
                  <UserAvatarMenu
                    userName={session.user.name || "User"}
                    userEmail={session.user.email || ""}
                    userImage={session.user.image || ""}
                  />
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link href="/auth/login" className="py-2.5 px-5 rounded-full font-semibold  text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all whitespace-nowrap hidden sm:block">
                      Masuk
                    </Link>
                    <Link href="/auth/register" className="py-2.5 px-5 font-semibold text-primary-foreground bg-primary/95 hover:bg-primary shadow-md shadow-primary/20 rounded-full transition-all whitespace-nowrap">
                      Daftar
                    </Link>
                  </div>
                )}
              </li>
            </ul>

            {/* MOBILE TABS MENU */}
            <div className="flex lg:hidden items-center shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full text-foreground bg-background/60 backdrop-blur-md border border-border/60 hover:bg-muted transition-colors duration-300 outline-none shadow-sm">
                    <Menu size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-3 p-2 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl z-50">
                  <DropdownMenuGroup className="p-1 flex flex-col gap-1">
                    {tabItems.map((tab) => {
                      if (tab.type === "separator") return null;
                      const isActive = pathname && tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href as string);
                      return (
                        <DropdownMenuItem key={tab.title} asChild className={cn("text-[14px] font-semibold  gap-3 py-3 px-4 rounded-xl cursor-pointer transition-colors focus:bg-primary/10", isActive ? "text-primary focus:text-primary bg-primary/10" : "focus:text-foreground focus:bg-muted/50")}>
                          <Link href={tab.href as string}>
                            <tab.icon size={18} />
                            <span>{tab.title}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}